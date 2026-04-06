import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalItemEntity } from '@/domain/entities/goal-item.entity';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

const goalRelations = ['participants', 'participants.user', 'items'] as const;

@Injectable()
export class DeleteGoalItemUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
    @InjectRepository(GoalItemEntity)
    private readonly itemRepository: Repository<GoalItemEntity>,
  ) {}

  async execute(
    goalId: string,
    itemId: string,
    requesterUserId: string,
  ): Promise<GoalResponseDto> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, goalId },
      relations: ['goal', 'goal.participants'],
    });

    if (!item) {
      throw new NotFoundException('Goal item not found.');
    }

    const isParticipant = item.goal.participants?.some(
      (p) => p.userId === requesterUserId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this goal.');
    }

    await this.itemRepository.remove(item);

    const refreshed = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: [...goalRelations],
    });

    if (!refreshed) {
      throw new NotFoundException('Goal not found.');
    }

    return GoalResponseDto.fromEntity(refreshed);
  }
}
