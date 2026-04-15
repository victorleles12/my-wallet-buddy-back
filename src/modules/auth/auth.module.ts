import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { AuthController } from './api/controller/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { TwoFactorCodeStore } from './services/two-factor-code.store';
import { LoginWithGoogleUseCase } from './use-cases/login-with-google.use-case';
import { RequestLoginCodeUseCase } from './use-cases/request-login-code.use-case';
import { VerifyLoginCodeUseCase } from './use-cases/verify-login-code.use-case';
import { jwtExpiryToSeconds } from './utils/jwt-expiry.util';
import { MailService } from '@/infrastructure/email/mail.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret || secret.length < 32) {
          throw new Error(
            'JWT_SECRET must be set in the environment and be at least 32 characters long.',
          );
        }
        const expiresInRaw =
          configService.get<string>('JWT_EXPIRES_IN') ?? '24h';
        return {
          secret,
          signOptions: {
            expiresIn: jwtExpiryToSeconds(expiresInRaw),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    MailService,
    TwoFactorCodeStore,
    RequestLoginCodeUseCase,
    VerifyLoginCodeUseCase,
    LoginWithGoogleUseCase,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    JwtAuthGuard,
    JwtModule,
    PassportModule,
    MailService,
    TwoFactorCodeStore,
  ],
})
export class AuthModule {}
