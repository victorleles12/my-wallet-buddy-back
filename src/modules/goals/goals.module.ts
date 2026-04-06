import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalItemEntity } from '@/domain/entities/goal-item.entity';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalParticipantEntity } from '@/domain/entities/goal-participant.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import { GoalsController } from './api/controller/goals.controller';
import { AddGoalParticipantsUseCase } from './use-cases/add-goal-participants.use-case';
import { CreateGoalItemUseCase } from './use-cases/create-goal-item.use-case';
import { CreateGoalWithParticipantsUseCase } from './use-cases/create-goal-with-participants.use-case';
import { DeleteGoalItemUseCase } from './use-cases/delete-goal-item.use-case';
import { DeleteGoalUseCase } from './use-cases/delete-goal.use-case';
import { GetGoalByIdUseCase } from './use-cases/get-goal-by-id.use-case';
import { ListGoalsForUserUseCase } from './use-cases/list-goals-for-user.use-case';
import { UpdateGoalItemUseCase } from './use-cases/update-goal-item.use-case';
import { UpdateGoalUseCase } from './use-cases/update-goal.use-case';
import { UpdateMyContributionUseCase } from './use-cases/update-my-contribution.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GoalEntity,
      GoalParticipantEntity,
      GoalItemEntity,
      UserEntity,
    ]),
  ],
  controllers: [GoalsController],
  providers: [
    CreateGoalWithParticipantsUseCase,
    ListGoalsForUserUseCase,
    GetGoalByIdUseCase,
    AddGoalParticipantsUseCase,
    UpdateGoalUseCase,
    UpdateMyContributionUseCase,
    DeleteGoalUseCase,
    CreateGoalItemUseCase,
    UpdateGoalItemUseCase,
    DeleteGoalItemUseCase,
  ],
})
export class GoalsModule {}
