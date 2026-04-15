import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyBillEntity } from '@/domain/entities/monthly-bill.entity';
import { MonthlyBillTemplateResponseDto } from '../api/dto/monthly-bill-template.response.dto';
import { UpdateMonthlyBillRequestDto } from '../api/dto/update-monthly-bill.request.dto';

@Injectable()
export class UpdateMonthlyBillUseCase {
  constructor(
    @InjectRepository(MonthlyBillEntity)
    private readonly billRepository: Repository<MonthlyBillEntity>,
  ) {}

  async execute(
    billId: string,
    userId: string,
    body: UpdateMonthlyBillRequestDto,
  ): Promise<MonthlyBillTemplateResponseDto> {
    const bill = await this.billRepository.findOne({ where: { id: billId } });
    if (!bill || bill.userId !== userId) {
      throw new NotFoundException('Monthly bill not found.');
    }

    const hasAmount =
      body.amount !== null &&
      body.amount !== undefined &&
      Number.isFinite(body.amount);

    bill.name = body.name.trim();
    bill.description = body.description.trim();
    bill.dueDay = body.dueDay;
    bill.amount = hasAmount ? body.amount!.toFixed(2) : null;

    const saved = await this.billRepository.save(bill);
    return MonthlyBillTemplateResponseDto.fromEntity(saved);
  }
}
