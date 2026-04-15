import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const LOGIN_CODE_TTL_MINUTES = 5;

type DeliveryMode = 'mailgun' | 'smtp' | 'none';

/** Cliente mínimo usado pelo mailgun.js (evita dependência forte de tipos). */
type MailgunMessagesClient = {
  messages: {
    create: (
      domain: string,
      data: {
        from: string;
        to: string[];
        subject: string;
        text: string;
        html: string;
      },
    ) => Promise<unknown>;
  };
};

function buildLoginCodePayload(code: string): { subject: string; text: string; html: string } {
  const subject = 'Seu código de acesso — FinanControl';
  const text = [
    `Seu código de verificação é: ${code}`,
    '',
    `Ele é válido por ${LOGIN_CODE_TTL_MINUTES} minutos.`,
    '',
    'Se você não tentou entrar, ignore este e-mail.',
  ].join('\n');

  const html = `
      <p>Seu código de verificação é:</p>
      <p style="font-size:26px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
      <p>Ele é válido por <strong>${LOGIN_CODE_TTL_MINUTES} minutos</strong>.</p>
      <p style="color:#666;font-size:13px">Se você não tentou entrar, ignore este e-mail.</p>
    `.trim();

  return { subject, text, html };
}

export type SensitiveEmailAction = 'delete_account' | 'clear_financial_data';

function buildSensitiveActionPayload(
  action: SensitiveEmailAction,
  code: string,
): { subject: string; text: string; html: string } {
  const label =
    action === 'delete_account'
      ? 'confirmar exclusão da sua conta'
      : 'confirmar limpeza dos seus dados financeiros na conta';
  const subject =
    action === 'delete_account'
      ? 'Código para excluir conta — My Wallet Buddy'
      : 'Código para limpar dados financeiros — My Wallet Buddy';
  const text = [
    `Use este código para ${label}:`,
    '',
    code,
    '',
    `Válido por ${LOGIN_CODE_TTL_MINUTES} minutos.`,
    '',
    'Se você não solicitou esta ação, ignore este e-mail e altere a sua palavra-passe.',
  ].join('\n');

  const html = `
      <p>Use este código para <strong>${label}</strong>:</p>
      <p style="font-size:26px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
      <p>Válido por <strong>${LOGIN_CODE_TTL_MINUTES} minutos</strong>.</p>
      <p style="color:#666;font-size:13px">Se você não solicitou esta ação, ignore este e-mail.</p>
    `.trim();

  return { subject, text, html };
}

/** Extrai mensagem útil do erro retornado pelo mailgun.js / axios. */
function formatMailgunSendError(err: unknown): string {
  if (err == null) return 'Erro desconhecido ao chamar Mailgun.';
  if (typeof err === 'string') return err;

  const o = err as Record<string, unknown> & {
    message?: string;
    details?: string;
    status?: number;
    body?: unknown;
    response?: {
      body?: unknown;
      data?: unknown;
      status?: number;
      statusText?: string;
    };
  };

  const parts: string[] = [];

  if (typeof o.message === 'string' && o.message.trim()) {
    parts.push(o.message.trim());
  }
  if (typeof o.details === 'string' && o.details.trim()) {
    parts.push(o.details.trim());
  }

  const attachBody = (label: string, body: unknown) => {
    if (body === undefined || body === null) return;
    if (typeof body === 'string') {
      const t = body.trim();
      if (t) parts.push(`${label}: ${t}`);
      return;
    }
    if (typeof body === 'object') {
      try {
        const b = body as Record<string, unknown>;
        if (typeof b.message === 'string') {
          parts.push(`${label}.message: ${b.message}`);
        }
        if (typeof b.error === 'string') {
          parts.push(`${label}.error: ${b.error}`);
        }
        parts.push(`${label}: ${JSON.stringify(body)}`);
      } catch {
        parts.push(`${label}: [não serializável]`);
      }
    }
  };

  attachBody('body', o.body);

  if (o.response && typeof o.response === 'object') {
    const r = o.response;
    const st = r.status;
    const stText = r.statusText;
    if (st != null) {
      parts.push(`HTTP ${st}${stText ? ` ${stText}` : ''}`);
    }
    const payload = r.data ?? r.body;
    if (payload !== undefined && payload !== null) {
      if (typeof payload === 'object') {
        const p = payload as Record<string, unknown>;
        if (typeof p.message === 'string') parts.push(p.message);
        else parts.push(JSON.stringify(payload));
      } else {
        attachBody('response', payload);
      }
    }
  }

  const cause = (o as { cause?: unknown }).cause;
  if (cause) {
    const c = formatMailgunSendError(cause);
    if (c) parts.push(`cause: ${c}`);
  }

  const out = parts.filter(Boolean).join(' | ');
  return out || String(err);
}

function resolveMailgunApiUrl(config: ConfigService): string | undefined {
  const explicit = config.get<string>('MAILGUN_API_URL')?.trim();
  if (explicit) return explicit;

  const region = config.get<string>('MAILGUN_REGION')?.trim().toLowerCase();
  if (region === 'eu' || region === 'europe') {
    return 'https://api.eu.mailgun.net';
  }

  return undefined;
}

@Injectable()
export class MailService {
  private readonly mode: DeliveryMode;
  private readonly transporter: Transporter | null;
  private readonly mailgunClient: MailgunMessagesClient | null;
  private readonly mailgunDomain: string | null;
  private readonly mailgunFrom: string | null;

  constructor(private readonly config: ConfigService) {
    const mgKey = this.config.get<string>('MAILGUN_API_KEY')?.trim();
    const mgDomain = this.config.get<string>('MAILGUN_DOMAIN')?.trim();

    if (mgKey && mgDomain) {
      // mailgun.js + form-data (CommonJS) — mesmo padrão da documentação Mailgun
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const FormDataMod = require('form-data');
      const FormDataCtor = FormDataMod.default ?? FormDataMod;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const MailgunMod = require('mailgun.js');
      const MailgunClass = MailgunMod.default ?? MailgunMod;
      const mailgun = new MailgunClass(FormDataCtor);
      const apiUrl = resolveMailgunApiUrl(this.config);
      this.mailgunClient = mailgun.client({
        username: 'api',
        key: mgKey,
        ...(apiUrl ? { url: apiUrl } : {}),
      }) as MailgunMessagesClient;
      this.mailgunDomain = mgDomain;
      const fromEnv = this.config.get<string>('MAILGUN_FROM')?.trim();
      this.mailgunFrom =
        fromEnv || `FinanControl <postmaster@${mgDomain}>`;
      this.mode = 'mailgun';
      this.transporter = null;
      return;
    }

    this.mailgunClient = null;
    this.mailgunDomain = null;
    this.mailgunFrom = null;

    const host = this.config.get<string>('SMTP_HOST')?.trim();
    if (!host) {
      this.transporter = null;
      this.mode = 'none';
      return;
    }

    const port = Number(this.config.get<string>('SMTP_PORT') ?? '587');
    const secure =
      this.config.get<string>('SMTP_SECURE') === 'true' || port === 465;
    const user = this.config.get<string>('SMTP_USER')?.trim();
    const pass = this.config.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        user && pass !== undefined && pass !== ''
          ? { user, pass }
          : undefined,
      tls: {
        rejectUnauthorized:
          this.config.get<string>('SMTP_TLS_REJECT_UNAUTHORIZED') !== 'false',
      },
    });
    this.mode = 'smtp';
  }

  /** Há canal configurado para enviar e-mail (Mailgun ou SMTP). */
  canSendEmail(): boolean {
    return this.mode !== 'none';
  }

  async sendLoginCode(to: string, code: string): Promise<void> {
    const { subject, text, html } = buildLoginCodePayload(code);

    if (this.mode === 'mailgun' && this.mailgunClient && this.mailgunDomain) {
      try {
        await this.mailgunClient.messages.create(this.mailgunDomain, {
          from: this.mailgunFrom!,
          to: [to],
          subject,
          text,
          html,
        });
      } catch (err: unknown) {
        throw new Error(formatMailgunSendError(err));
      }
      return;
    }

    if (this.mode === 'smtp' && this.transporter) {
      const fromRaw =
        this.config.get<string>('MAIL_FROM')?.trim() ||
        (this.config.get<string>('SMTP_USER')?.trim()
          ? `FinanControl <${this.config.get<string>('SMTP_USER')!.trim()}>`
          : 'FinanControl <noreply@localhost>');

      await this.transporter.sendMail({
        from: fromRaw,
        to,
        subject,
        text,
        html,
      });
      return;
    }

    throw new Error('No email delivery configured');
  }

  async sendSensitiveActionCode(
    to: string,
    code: string,
    action: SensitiveEmailAction,
  ): Promise<void> {
    const { subject, text, html } = buildSensitiveActionPayload(action, code);

    if (this.mode === 'mailgun' && this.mailgunClient && this.mailgunDomain) {
      try {
        await this.mailgunClient.messages.create(this.mailgunDomain, {
          from: this.mailgunFrom!,
          to: [to],
          subject,
          text,
          html,
        });
      } catch (err: unknown) {
        throw new Error(formatMailgunSendError(err));
      }
      return;
    }

    if (this.mode === 'smtp' && this.transporter) {
      const fromRaw =
        this.config.get<string>('MAIL_FROM')?.trim() ||
        (this.config.get<string>('SMTP_USER')?.trim()
          ? `FinanControl <${this.config.get<string>('SMTP_USER')!.trim()}>`
          : 'FinanControl <noreply@localhost>');

      await this.transporter.sendMail({
        from: fromRaw,
        to,
        subject,
        text,
        html,
      });
      return;
    }

    throw new Error('No email delivery configured');
  }
}
