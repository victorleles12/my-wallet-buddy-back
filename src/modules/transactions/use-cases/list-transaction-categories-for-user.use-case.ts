import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';
import { TransactionCategoriesResponseDto } from '../api/dto/transaction-categories.response.dto';

@Injectable()
export class ListTransactionCategoriesForUserUseCase {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly familyMemberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(userId: string): Promise<TransactionCategoriesResponseDto> {
    const memberships = await this.familyMemberRepository.find({
      where: { userId },
      select: ['familyGroupId'],
    });
    const groupIds = [...new Set(memberships.map((m) => m.familyGroupId))];

    const qb = this.transactionRepository.createQueryBuilder('t');

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

    qb.andWhere("TRIM(t.category) <> ''")
      .select('t.type', 'type')
      .addSelect('MIN(TRIM(t.category))', 'label')
      .groupBy('t.type')
      .addGroupBy('LOWER(TRIM(t.category))');

    const rows = (await qb.getRawMany()) as { type: string; label: string }[];

    const expense: string[] = [];
    const income: string[] = [];
    for (const r of rows) {
      const name = (r.label ?? '').trim();
      if (!name) continue;
      if (r.type === 'expense') expense.push(name);
      else if (r.type === 'income') income.push(name);
    }

    expense.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));
    income.sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }));

    return { expense, income };
  }
}
