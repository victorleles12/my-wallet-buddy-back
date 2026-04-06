import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '@/domain/entities/transaction.entity';

@Injectable()
export class DeleteTransactionUseCase {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async execute(transactionId: string, requesterUserId: string): Promise<void> {
    const row = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (!row) {
      throw new NotFoundException('Transaction not found.');
    }
    if (row.userId !== requesterUserId) {
      throw new ForbiddenException(
        'Only the user who created this transaction can delete it.',
      );
    }
    await this.transactionRepository.remove(row);
  }
}
