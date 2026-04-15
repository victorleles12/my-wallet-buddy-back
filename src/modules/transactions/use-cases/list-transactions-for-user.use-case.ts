import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';
import { TransactionResponseDto } from '../api/dto/transaction.response.dto';

@Injectable()
export class ListTransactionsForUserUseCase {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly familyMemberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<TransactionResponseDto[]> {
    const memberships = await this.familyMemberRepository.find({
      where: { userId },
      select: ['familyGroupId'],
    });
    const groupIds = [...new Set(memberships.map((m) => m.familyGroupId))];

    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.familyGroup', 'familyGroup');

    if (groupIds.length === 0) {
      qb.where('t.user_id = :uid AND t.is_family = false', { uid: userId });
    } else {
      qb.where(
        new Brackets((expr) => {
          expr.where('t.user_id = :uid AND t.is_family = false', { uid: userId });
          expr.orWhere('t.is_family = true AND t.family_group_id IN (:...gids)', {
            gids: groupIds,
          });
        }),
      );
    }

    qb.orderBy('t.occurredOn', 'DESC').addOrderBy('t.createdAt', 'DESC');
    qb.take(limit).skip(offset);

    const rows = await qb.getMany();
    return rows.map((r) => TransactionResponseDto.fromEntity(r));
  }
}
