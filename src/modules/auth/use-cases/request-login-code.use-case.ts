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
import { RequestLoginCodeDto } from '../api/dto/request-login-code.dto';
import {
  TWO_FA_PURPOSE_LOGIN,
  TwoFactorCodeStore,
} from '../services/two-factor-code.store';

@Injectable()
export class RequestLoginCodeUseCase {
  private readonly logger = new Logger(RequestLoginCodeUseCase.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly twoFactorCodeStore: TwoFactorCodeStore,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: RequestLoginCodeDto): Promise<{ message: string }> {
    const emailLower = dto.email.trim().toLowerCase();
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('LOWER(TRIM(u.email)) = :email', { email: emailLower })
      .getOne();

    const invalid = new UnauthorizedException('Invalid email or password.');

    if (!user || !user.enabled) {
      throw invalid;
    }

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw invalid;
    }

    const lockRemainingMs = this.twoFactorCodeStore.getLockRemainingMs(
      user.email,
      user.id,
      TWO_FA_PURPOSE_LOGIN,
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
      TWO_FA_PURPOSE_LOGIN,
    );

    if (this.mailService.canSendEmail()) {
      try {
        await this.mailService.sendLoginCode(user.email, code);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed to send 2FA email to ${user.email}: ${msg}`,
          err instanceof Error ? err.stack : undefined,
        );
        throw new ServiceUnavailableException(
          'Não foi possível enviar o código por e-mail. Tente novamente em instantes.',
        );
      }
      return {
        message:
          'Se as credenciais estiverem corretas, enviámos um código de 6 dígitos para o seu e-mail. Ele expira em 5 minutos.',
      };
    }

    this.logger.warn(
      `[2FA / sem envio] Login code for ${user.email}: ${code} (expira em 5 min). Configure MAILGUN_API_KEY + MAILGUN_DOMAIN ou SMTP_HOST.`,
    );

    return {
      message:
        'Se as credenciais estiverem corretas, um código de 6 dígitos foi gerado. Sem Mailgun/SMTP configurado, ele aparece no log do servidor (desenvolvimento).',
    };
  }
}
