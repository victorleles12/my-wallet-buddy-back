import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { TwoFactorCodeStore } from '../services/two-factor-code.store';
import { RequestLoginCodeDto } from '../api/dto/request-login-code.dto';

@Injectable()
export class RequestLoginCodeUseCase {
  private readonly logger = new Logger(RequestLoginCodeUseCase.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly twoFactorCodeStore: TwoFactorCodeStore,
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

    const code = this.twoFactorCodeStore.generateAndStore(user.email);
    this.logger.warn(
      `[2FA / DEV] Login code for ${user.email}: ${code} (expires in 5 minutes)`,
    );

    return {
      message:
        'If your credentials are correct, a 6-digit code was generated. Check the server terminal.',
    };
  }
}
