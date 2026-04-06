import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '@/domain/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email?: string;
  type?: string;
  tv?: number;
}

interface CachedAuthUser {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly authCache = new Map<string, CachedAuthUser>();
  private readonly authCacheTtlMs: number;

  constructor(
    configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_SECRET must be set in the environment and be at least 32 characters long.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.authCacheTtlMs = Number(
      configService.get<string>('JWT_AUTH_CACHE_TTL_MS', '30000'),
    );
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ userId: string; email: string; role: UserRole }> {
    if (payload.type !== 'user' || !payload.sub) {
      throw new UnauthorizedException();
    }

    const tokenVersion = payload.tv ?? -1;
    const cacheKey = `${payload.sub}:${tokenVersion}`;
    const cached = this.authCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { userId: cached.userId, email: cached.email, role: cached.role };
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user || !user.enabled) {
      throw new UnauthorizedException();
    }
    if (payload.tv !== user.tokenVersion) {
      throw new UnauthorizedException();
    }
    const result = { userId: user.id, email: user.email, role: user.role };
    this.authCache.set(cacheKey, {
      ...result,
      expiresAt: Date.now() + this.authCacheTtlMs,
    });
    return result;
  }
}
