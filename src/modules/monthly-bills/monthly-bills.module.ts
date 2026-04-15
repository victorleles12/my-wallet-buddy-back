import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyBillMonthStateEntity } from '@/domain/entities/monthly-bill-month-state.entity';
import { MonthlyBillEntity } from '@/domain/entities/monthly-bill.entity';
import { MonthlyBillsController } from './api/controller/monthly-bills.controller';
import { CreateMonthlyBillUseCase } from './use-cases/create-monthly-bill.use-case';
import { DeleteMonthlyBillUseCase } from './use-cases/delete-monthly-bill.use-case';
import { GetMonthlyBillsSummaryUseCase } from './use-cases/get-monthly-bills-summary.use-case';
import { UpdateMonthlyBillUseCase } from './use-cases/update-monthly-bill.use-case';
import { UpsertMonthlyBillStateUseCase } from './use-cases/upsert-monthly-bill-state.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonthlyBillEntity, MonthlyBillMonthStateEntity]),
  ],
  controllers: [MonthlyBillsController],
  providers: [
    GetMonthlyBillsSummaryUseCase,
    CreateMonthlyBillUseCase,
    UpdateMonthlyBillUseCase,
    DeleteMonthlyBillUseCase,
    UpsertMonthlyBillStateUseCase,
  ],
})
export class MonthlyBillsModule {}
