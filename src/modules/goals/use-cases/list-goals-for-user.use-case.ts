import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalResponseDto } from '../api/dto/goal.response.dto';

@Injectable()
export class ListGoalsForUserUseCase {
  constructor(
    @InjectRepository(GoalEntity)
    private readonly goalRepository: Repository<GoalEntity>,
  ) {}

  async execute(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<GoalResponseDto[]> {
    const goals = await this.goalRepository
      .createQueryBuilder('goal')
      .innerJoinAndSelect('goal.participants', 'p')
      .innerJoinAndSelect('p.user', 'user')
      .leftJoinAndSelect('goal.items', 'items')
      .where('p.user_id = :userId', { userId })
      .orderBy('goal.deadline', 'ASC')
      .addOrderBy('goal.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();

    return goals.map((g) => GoalResponseDto.fromEntity(g));
  }
}
