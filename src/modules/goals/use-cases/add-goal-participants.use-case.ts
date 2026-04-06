import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalParticipantEntity } from '@/domain/entities/goal-participant.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import { AddGoalParticipantsRequestDto } from '../api/dto/add-goal-participants.request.dto';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

@Injectable()
export class AddGoalParticipantsUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
    @InjectRepository(GoalParticipantEntity)
    private readonly participantRepository: Repository<GoalParticipantEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(
    goalId: string,
    requesterUserId: string,
    dto: AddGoalParticipantsRequestDto,
  ): Promise<GoalResponseDto> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId },
      relations: ['participants', 'participants.user', 'items'],
    });

    if (!goal) {
      throw new NotFoundException('Goal not found.');
    }

    const requesterIsParticipant = goal.participants?.some(
      (p) => p.userId === requesterUserId,
    );
    if (!requesterIsParticipant) {
      throw new ForbiddenException('You are not a participant of this goal.');
    }

    const existingIds = new Set(goal.participants.map((p) => p.userId));
    const toAdd = dto.userIds.filter((id) => !existingIds.has(id));

    if (toAdd.length === 0) {
      throw new BadRequestException(
        'All given users are already participants.',
      );
    }

    const users = await this.userRepository.find({
      where: { id: In(toAdd), enabled: true },
    });

    if (users.length !== toAdd.length) {
      throw new NotFoundException(
        'One or more user IDs are invalid or disabled.',
      );
    }

    const rows = toAdd.map((userId) =>
      this.participantRepository.create({
        goalId: goal.id,
        userId,
        currentAmount: '0.00',
      }),
    );

    await this.participantRepository.save(rows);

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
