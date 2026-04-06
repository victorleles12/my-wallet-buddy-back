import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';

@Injectable()
export class DeleteGoalUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
  ) {}

  async execute(goalId: string, requesterUserId: string): Promise<void> {
    const goal = await this.goalRepository.findOne({ where: { id: goalId } });

    if (!goal) {
      throw new NotFoundException('Goal not found.');
    }

    if (goal.createdByUserId !== requesterUserId) {
      throw new ForbiddenException('Only the creator can delete this goal.');
    }

    await this.goalRepository.remove(goal);
  }
}
