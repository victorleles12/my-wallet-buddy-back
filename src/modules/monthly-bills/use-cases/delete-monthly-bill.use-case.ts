import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyBillEntity } from '@/domain/entities/monthly-bill.entity';

@Injectable()
export class DeleteMonthlyBillUseCase {
  constructor(
    @InjectRepository(MonthlyBillEntity)
    private readonly billRepository: Repository<MonthlyBillEntity>,
  ) {}

  async execute(billId: string, userId: string): Promise<void> {
    const bill = await this.billRepository.findOne({ where: { id: billId } });
    if (!bill || bill.userId !== userId) {
      throw new NotFoundException('Monthly bill not found.');
    }
    await this.billRepository.remove(bill);
  }
}
