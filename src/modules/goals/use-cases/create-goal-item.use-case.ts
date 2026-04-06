import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalItemEntity } from '@/domain/entities/goal-item.entity';
import { CreateGoalItemRequestDto } from '../api/dto/create-goal-item.request.dto';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

const goalRelations = ['participants', 'participants.user', 'items'] as const;

@Injectable()
export class CreateGoalItemUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
    @InjectRepository(GoalItemEntity)
    private readonly itemRepository: Repository<GoalItemEntity>,
  ) {}

  async execute(
    goalId: string,
    requesterUserId: string,
    dto: CreateGoalItemRequestDto,
  ): Promise<GoalResponseDto> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: [...goalRelations],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found.');
    }

    const isParticipant = goal.participants?.some(
      (p) => p.userId === requesterUserId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this goal.');
    }

    const count = await this.itemRepository.count({ where: { goalId } });
    const item = this.itemRepository.create({
      goalId,
      label: dto.label.trim(),
      amount: dto.amount.toFixed(2),
      sortOrder: count,
    });
    await this.itemRepository.save(item);

    const refreshed = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: [...goalRelations],
    });

    if (!refreshed) {
      throw new NotFoundException('Goal not found after creating item.');
    }

    return GoalResponseDto.fromEntity(refreshed);
  }
}
