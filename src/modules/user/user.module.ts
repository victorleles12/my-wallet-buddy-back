import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserController } from './api/controller/user.controller';
import { CreateUserUseCase } from './use-cases/create.user.use-case';
import { DeleteUserUseCase } from './use-cases/delete.user.use-case';
import { GetUserByIdUseCase } from './use-cases/get.user.by.id.use-case';
import { ListUsersUseCase } from './use-cases/list.users.use-case';
import { UpdateUserUseCase } from './use-cases/update.user.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UserModule {}
