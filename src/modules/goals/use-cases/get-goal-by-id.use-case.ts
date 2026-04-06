import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

@Injectable()
export class GetGoalByIdUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
  ) {}

  async execute(
    goalId: string,
    requesterUserId: string,
  ): Promise<GoalResponseDto> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['participants', 'participants.user', 'items'],
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

    return GoalResponseDto.fromEntity(goal);
  }
}
