import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';
import { TransactionsController } from './api/controller/transactions.controller';
import { CreateTransactionUseCase } from './use-cases/create-transaction.use-case';
import { DeleteTransactionUseCase } from './use-cases/delete-transaction.use-case';
import { GetTransactionByIdUseCase } from './use-cases/get-transaction-by-id.use-case';
import { ListTransactionCategoriesForUserUseCase } from './use-cases/list-transaction-categories-for-user.use-case';
import { ListTransactionsForUserUseCase } from './use-cases/list-transactions-for-user.use-case';
import { UpdateTransactionUseCase } from './use-cases/update-transaction.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, FamilyGroupMemberEntity]),
  ],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUseCase,
    ListTransactionsForUserUseCase,
    ListTransactionCategoriesForUserUseCase,
    GetTransactionByIdUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
  ],
})
export class TransactionsModule {}
