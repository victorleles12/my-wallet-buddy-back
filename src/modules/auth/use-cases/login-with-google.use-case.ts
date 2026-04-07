import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { normalizeEmail } from '@/modules/user/utils/normalize-user-fields.util';
import { AuthTokenResponseDto } from '../api/dto/auth-token.response.dto';
import { jwtExpiryToSeconds } from '../utils/jwt-expiry.util';

@Injectable()
export class LoginWithGoogleUseCase {
  private readonly oauth = new OAuth2Client();

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getAudiences(): string[] {
    const raw =
      this.configService.get<string>('GOOGLE_OAUTH_CLIENT_IDS') ?? '';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  async execute(idToken: string): Promise<AuthTokenResponseDto> {
    const audiences = this.getAudiences();
    if (audiences.length === 0) {
      throw new InternalServerErrorException(
        'Google login is not configured (GOOGLE_OAUTH_CLIENT_IDS).',
      );
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.oauth.verifyIdToken({
        idToken,
        audience: audiences,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token.');
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Google account has no email.');
    }
    if (payload.email_verified === false) {
      throw new UnauthorizedException('Google email is not verified.');
    }

    const email = normalizeEmail(payload.email);
    let user = await this.userRepository
      .createQueryBuilder('u')
      .where('LOWER(TRIM(u.email)) = :email', { email })
      .getOne();

    if (!user) {
      const sub = payload.sub;
      if (!sub) {
        throw new UnauthorizedException('Invalid Google token payload.');
      }
      const document = createHash('sha256')
        .update(`google:${sub}`)
        .digest('hex')
        .slice(0, 30);
      const rawFirst =
        payload.given_name?.trim() ||
        payload.name?.trim().split(/\s+/)[0] ||
        'Utilizador';
      const firstName = rawFirst.slice(0, 100);
      const rest = payload.name?.trim().split(/\s+/).slice(1).join(' ') ?? '';
      const lastName = (payload.family_name?.trim() || rest || '-').slice(
        0,
        100,
      );
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);

      user = this.userRepository.create({
        firstName,
        lastName,
        document,
        address: '(Completar no perfil)',
        sex: 'other',
        email,
        phone: '0',
        passwordHash,
        enabled: true,
        role: 'user',
      });
      await this.userRepository.save(user);
    }

    if (!user.enabled) {
      throw new UnauthorizedException('Account is disabled.');
    }

    const expiresInRaw = process.env.JWT_EXPIRES_IN ?? '24h';
    const expiresInSec = jwtExpiryToSeconds(expiresInRaw);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: 'user',
        tv: user.tokenVersion,
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
