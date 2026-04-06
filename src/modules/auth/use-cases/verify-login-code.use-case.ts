import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { TwoFactorCodeStore } from '../services/two-factor-code.store';
import { VerifyLoginCodeDto } from '../api/dto/verify-login-code.dto';
import { AuthTokenResponseDto } from '../api/dto/auth-token.response.dto';
import { jwtExpiryToSeconds } from '../utils/jwt-expiry.util';

@Injectable()
export class VerifyLoginCodeUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly twoFactorCodeStore: TwoFactorCodeStore,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: VerifyLoginCodeDto): Promise<AuthTokenResponseDto> {
    const emailLower = dto.email.trim().toLowerCase();
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('LOWER(TRIM(u.email)) = :email', { email: emailLower })
      .getOne();

    if (!user || !user.enabled) {
      throw new UnauthorizedException('Invalid or expired code.');
    }

    const ok = this.twoFactorCodeStore.verifyAndConsume(user.email, dto.code);
    if (!ok) {
      throw new UnauthorizedException('Invalid or expired code.');
    }

    const expiresInRaw = process.env.JWT_EXPIRES_IN ?? '24h';
    const expiresInSec = jwtExpiryToSeconds(expiresInRaw);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: 'user',
      },
      { expiresIn: expiresInSec },
    );

    return {
      accessToken,
      tokenType: 'bearer',
      expiresIn: expiresInSec,
    };
  }
}
