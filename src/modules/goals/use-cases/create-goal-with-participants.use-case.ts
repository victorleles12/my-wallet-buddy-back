import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalParticipantEntity } from '@/domain/entities/goal-participant.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import { CreateGoalWithParticipantsRequestDto } from '../api/dto/create-goal-with-participants.request.dto';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

@Injectable()
export class CreateGoalWithParticipantsUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
    @InjectRepository(GoalParticipantEntity)
    private readonly participantRepository: Repository<GoalParticipantEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(
    creatorUserId: string,
    dto: CreateGoalWithParticipantsRequestDto,
  ): Promise<GoalResponseDto> {
    const uniqueIds = [
      ...new Set([creatorUserId, ...dto.participantUserIds]),
    ];

    const users = await this.userRepository.find({
      where: { id: In(uniqueIds), enabled: true },
    });

    if (users.length !== uniqueIds.length) {
      throw new NotFoundException(
        'One or more participant user IDs are invalid or disabled.',
      );
    }

    const goal = this.goalRepository.create({
      name: dto.name.trim(),
      targetAmount: dto.targetAmount.toFixed(2),
      deadline: dto.deadline.slice(0, 10),
      icon: dto.icon,
      createdByUserId: creatorUserId,
      participants: uniqueIds.map((userId) =>
        this.participantRepository.create({
          userId,
          currentAmount: '0.00',
        }),
      ),
    });

    const saved = await this.goalRepository.save(goal);

    const full = await this.goalRepository.findOne({
      where: { id: saved.id },
      relations: ['participants', 'participants.user', 'items'],
    });

    if (!full) {
      throw new BadRequestException('Could not load created goal.');
    }

    return GoalResponseDto.fromEntity(full);
  }
}
