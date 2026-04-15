import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

@Injectable()
export class ListGoalsForUserUseCase {
  private readonly listCache = new Map<
    string,
    { value: GoalResponseDto[]; expiresAt: number }
  >();
  private readonly cacheTtlMs = 10_000;

  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
  ) {}

  async execute(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<GoalResponseDto[]> {
    const cacheKey = `${userId}:${limit}:${offset}`;
    const cached = this.listCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const goals = await this.goalRepository
      .createQueryBuilder('goal')
      .innerJoin('goal.participants', 'filterParticipant')
      .leftJoinAndSelect('goal.participants', 'participants')
      .where('filterParticipant.user_id = :userId', { userId })
      .orderBy('goal.deadline', 'ASC')
      .addOrderBy('goal.createdAt', 'DESC')
      .distinct(true)
      .take(limit)
      .skip(offset)
      .getMany();

    const value = goals.map((g) =>
      GoalResponseDto.fromEntity(g, {
        includeItems: false,
        includeParticipantProfiles: false,
      }),
    );
    this.listCache.set(cacheKey, { value, expiresAt: now + this.cacheTtlMs });
    return value;
  }
}
