import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { UpdateGoalRequestDto } from '../api/dto/update-goal.request.dto';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

@Injectable()
export class UpdateGoalUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
  ) {}

  async execute(
    goalId: string,
    requesterUserId: string,
    dto: UpdateGoalRequestDto,
  ): Promise<GoalResponseDto> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['participants', 'participants.user', 'items'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found.');
    }

    if (goal.createdByUserId !== requesterUserId) {
      throw new ForbiddenException('Only the creator can update goal details.');
    }

    if (dto.name !== undefined) goal.name = dto.name.trim();
    if (dto.targetAmount !== undefined) {
      goal.targetAmount = dto.targetAmount.toFixed(2);
    }
    if (dto.deadline !== undefined) goal.deadline = dto.deadline.slice(0, 10);
    if (dto.icon !== undefined) goal.icon = dto.icon;

    await this.goalRepository.save(goal);

    const refreshed = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['participants', 'participants.user', 'items'],
    });

    if (!refreshed) {
      throw new NotFoundException('Goal not found after update.');
    }

    return GoalResponseDto.fromEntity(refreshed);
  }
}
