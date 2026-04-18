import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserController } from './api/controller/user.controller';
import { GooglePlaySubscriptionService } from './services/google-play-subscription.service';
import { ActivatePremiumUseCase } from './use-cases/activate-premium.use-case';
import { ClearUserFinancialDataUseCase } from './use-cases/clear-user-financial-data.use-case';
import { ConfirmSensitiveActionUseCase } from './use-cases/confirm-sensitive-action.use-case';
import { CreateUserUseCase } from './use-cases/create.user.use-case';
import { DeleteUserUseCase } from './use-cases/delete.user.use-case';
import { GetMyAccessUseCase } from './use-cases/get-my-access.use-case';
import { GetUserByIdUseCase } from './use-cases/get.user.by.id.use-case';
import { GrantAdAccessUseCase } from './use-cases/grant-ad-access.use-case';
import { ListUsersUseCase } from './use-cases/list.users.use-case';
import { RequestSensitiveActionCodeUseCase } from './use-cases/request-sensitive-action-code.use-case';
import { UpdateUserStatusUseCase } from './use-cases/update-user-status.use-case';
import { UpdateUserUseCase } from './use-cases/update.user.use-case';
import { VerifyPlaySubscriptionUseCase } from './use-cases/verify-play-subscription.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    UpdateUserStatusUseCase,
    DeleteUserUseCase,
    GetMyAccessUseCase,
    GrantAdAccessUseCase,
    GooglePlaySubscriptionService,
    ActivatePremiumUseCase,
    VerifyPlaySubscriptionUseCase,
    ClearUserFinancialDataUseCase,
    RequestSensitiveActionCodeUseCase,
    ConfirmSensitiveActionUseCase,
  ],
})
export class UserModule {}
