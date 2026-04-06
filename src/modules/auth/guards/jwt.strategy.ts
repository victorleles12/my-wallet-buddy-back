import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email?: string;
  type?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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
  }

  async validate(payload: JwtPayload): Promise<{ userId: string; email: string }> {
    if (payload.type !== 'user' || !payload.sub) {
      throw new UnauthorizedException();
    }
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.enabled) {
      throw new UnauthorizedException();
    }
    return { userId: user.id, email: user.email };
  }
}
