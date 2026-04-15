import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { MailService } from '@/infrastructure/email/mail.service';
import {
  TWO_FA_PURPOSE_CLEAR_FINANCIAL_DATA,
  TWO_FA_PURPOSE_DELETE_ACCOUNT,
  TwoFactorCodeStore,
} from '@/modules/auth/services/two-factor-code.store';
import type { SensitiveAccountAction } from '../api/dto/request-sensitive-action-code.dto';

function purposeForAction(action: SensitiveAccountAction): string {
  return action === 'delete_account'
    ? TWO_FA_PURPOSE_DELETE_ACCOUNT
    : TWO_FA_PURPOSE_CLEAR_FINANCIAL_DATA;
}

@Injectable()
export class RequestSensitiveActionCodeUseCase {
  private readonly logger = new Logger(RequestSensitiveActionCodeUseCase.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly twoFactorCodeStore: TwoFactorCodeStore,
    private readonly mailService: MailService,
  ) {}

  async execute(
    userId: string,
    action: SensitiveAccountAction,
    password: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.enabled) {
      throw new UnauthorizedException('Invalid session.');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid password.');
    }

    const purpose = purposeForAction(action);
    const lockRemainingMs = this.twoFactorCodeStore.getLockRemainingMs(
      user.email,
      user.id,
      purpose,
    );
    if (lockRemainingMs > 0) {
      const retryAfterSeconds = Math.ceil(lockRemainingMs / 1000);
      throw new HttpException(
        `Too many invalid code attempts. Try again in ${retryAfterSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = this.twoFactorCodeStore.generateAndStore(
      user.email,
      user.id,
      purpose,
    );

    const mailAction =
      action === 'delete_account' ? 'delete_account' : 'clear_financial_data';

    if (this.mailService.canSendEmail()) {
      try {
        await this.mailService.sendSensitiveActionCode(
          user.email,
          code,
          mailAction,
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed to send sensitive action email to ${user.email}: ${msg}`,
          err instanceof Error ? err.stack : undefined,
        );
        throw new ServiceUnavailableException(
          'Não foi possível enviar o código por e-mail. Tente novamente em instantes.',
        );
      }
      return {
        message:
          'Enviámos um código de 6 dígitos para o seu e-mail. Ele expira em 5 minutos.',
      };
    }

    this.logger.warn(
      `[2FA / sem envio] Código ${action} para ${user.email}: ${code} (expira em 5 min).`,
    );
    return {
      message:
        'Código gerado. Sem Mailgun/SMTP configurado, verifique o log do servidor (desenvolvimento).',
    };
  }
}
