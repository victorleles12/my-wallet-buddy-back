import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { DataBaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { GroupsModule } from './modules/groups/groups.module';
import { GoalsModule } from './modules/goals/goals.module';
import { CreditCardsModule } from './modules/credit-cards/credit-cards.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Merge do @nestjs/config: cada ficheiro faz assign(.env, estadoAnterior) — o *primeiro*
      // da lista define base; o segundo sobrepõe chaves iguais. Colocar `.env.development`
      // por último para o Postgres de dev ganhar sobre `.env`.
      envFilePath: ['.env.development', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    DataBaseModule,
    AuthModule,
    HealthModule,
    UserModule,
    GroupsModule,
    TransactionsModule,
    CreditCardsModule,
    GoalsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
