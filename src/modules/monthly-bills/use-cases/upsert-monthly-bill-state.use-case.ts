import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyBillMonthStateEntity } from '@/domain/entities/monthly-bill-month-state.entity';
import { MonthlyBillEntity } from '@/domain/entities/monthly-bill.entity';
import { UpsertMonthlyBillStateRequestDto } from '../api/dto/upsert-monthly-bill-state.request.dto';

@Injectable()
export class UpsertMonthlyBillStateUseCase {
  constructor(
    @InjectRepository(MonthlyBillEntity)
    private readonly billRepository: Repository<MonthlyBillEntity>,
    @InjectRepository(MonthlyBillMonthStateEntity)
    private readonly stateRepository: Repository<MonthlyBillMonthStateEntity>,
  ) {}

  async execute(userId: string, body: UpsertMonthlyBillStateRequestDto): Promise<void> {
    const bill = await this.billRepository.findOne({
      where: { id: body.templateId },
    });
    if (!bill || bill.userId !== userId) {
      throw new NotFoundException('Monthly bill not found.');
    }

    const existing = await this.stateRepository.findOne({
      where: { monthlyBillId: body.templateId, month: body.month },
    });

    if (!body.paid && !body.skippedForMonth) {
      if (existing) {
        await this.stateRepository.remove(existing);
      }
      return;
    }

    if (existing) {
      existing.paid = body.paid;
      existing.skippedForMonth = body.skippedForMonth;
      await this.stateRepository.save(existing);
      return;
    }

    const row = this.stateRepository.create({
      monthlyBillId: body.templateId,
      month: body.month,
      paid: body.paid,
      skippedForMonth: body.skippedForMonth,
    });
    await this.stateRepository.save(row);
  }
}
