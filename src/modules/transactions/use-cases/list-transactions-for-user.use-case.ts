import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async execute(userId: string): Promise<TransactionResponseDto[]> {
    const memberships = await this.familyMemberRepository.find({
      where: { userId },
      select: ['familyGroupId'],
    });
    const groupIds = [...new Set(memberships.map((m) => m.familyGroupId))];

    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.familyGroup', 'familyGroup')
      .where('t.user_id = :uid AND t.is_family = false', { uid: userId });

    if (groupIds.length > 0) {
      qb.orWhere(
        't.is_family = true AND t.family_group_id IN (:...gids)',
        { gids: groupIds },
      );
    }

    qb.orderBy('t.occurred_on', 'DESC').addOrderBy('t.created_at', 'DESC');

    const rows = await qb.getMany();
    return rows.map((r) => TransactionResponseDto.fromEntity(r));
  }
}
