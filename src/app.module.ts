import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DataBaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { GroupsModule } from './modules/groups/groups.module';
import { GoalsModule } from './modules/goals/goals.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataBaseModule,
    AuthModule,
    HealthModule,
    UserModule,
    GroupsModule,
    TransactionsModule,
    GoalsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
