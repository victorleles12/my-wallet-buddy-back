import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalParticipantEntity } from '@/domain/entities/goal-participant.entity';
import { UpdateMyContributionRequestDto } from '../api/dto/update-my-contribution.request.dto';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

@Injectable()
export class UpdateMyContributionUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
    @InjectRepository(GoalParticipantEntity)
    private readonly participantRepository: Repository<GoalParticipantEntity>,
  ) {}

  async execute(
    goalId: string,
    requesterUserId: string,
    dto: UpdateMyContributionRequestDto,
  ): Promise<GoalResponseDto> {
    const row = await this.participantRepository.findOne({
      where: { goalId, userId: requesterUserId },
    });

    if (!row) {
      throw new ForbiddenException('You are not a participant of this goal.');
    }

    row.currentAmount = dto.currentAmount.toFixed(2);
    await this.participantRepository.save(row);

    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['participants', 'participants.user', 'items'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found.');
    }

    return GoalResponseDto.fromEntity(goal);
  }
}
