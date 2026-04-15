import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalParticipantEntity } from '@/domain/entities/goal-participant.entity';
import { MonthlyBillEntity } from '@/domain/entities/monthly-bill.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';

@Injectable()
export class ClearUserFinancialDataUseCase {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute(userId: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      await qr.manager.delete(TransactionEntity, { userId });
      await qr.manager.delete(GoalParticipantEntity, { userId });
      await qr.manager.delete(GoalEntity, { createdByUserId: userId });
      await qr.manager.delete(CreditCardEntity, { userId });
      await qr.manager.delete(MonthlyBillEntity, { userId });
      await qr.manager.delete(FamilyGroupMemberEntity, { userId });
      await qr.commitTransaction();
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
}
