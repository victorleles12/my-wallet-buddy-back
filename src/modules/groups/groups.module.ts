import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import { GroupsController } from './api/controller/groups.controller';
import { AddGroupMemberByEmailUseCase } from './use-cases/add-group-member-by-email.use-case';
import { CreateGroupUseCase } from './use-cases/create-group.use-case';
import { DeleteGroupUseCase } from './use-cases/delete-group.use-case';
import { GetGroupByIdUseCase } from './use-cases/get-group-by-id.use-case';
import { ListMyGroupsUseCase } from './use-cases/list-my-groups.use-case';
import { RemoveGroupMemberUseCase } from './use-cases/remove-group-member.use-case';
import { UpdateGroupUseCase } from './use-cases/update-group.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FamilyGroupEntity,
      FamilyGroupMemberEntity,
      TransactionEntity,
      UserEntity,
    ]),
  ],
  controllers: [GroupsController],
  providers: [
    CreateGroupUseCase,
    ListMyGroupsUseCase,
    GetGroupByIdUseCase,
    UpdateGroupUseCase,
    DeleteGroupUseCase,
    AddGroupMemberByEmailUseCase,
    RemoveGroupMemberUseCase,
  ],
})
export class GroupsModule {}
