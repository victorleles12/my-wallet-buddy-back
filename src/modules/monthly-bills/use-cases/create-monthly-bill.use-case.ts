import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyBillEntity } from '@/domain/entities/monthly-bill.entity';
import { CreateMonthlyBillRequestDto } from '../api/dto/create-monthly-bill.request.dto';
import { MonthlyBillTemplateResponseDto } from '../api/dto/monthly-bill-template.response.dto';

@Injectable()
export class CreateMonthlyBillUseCase {
  constructor(
    @InjectRepository(MonthlyBillEntity)
    private readonly billRepository: Repository<MonthlyBillEntity>,
  ) {}

  async execute(
    userId: string,
    body: CreateMonthlyBillRequestDto,
  ): Promise<MonthlyBillTemplateResponseDto> {
    const hasAmount =
      body.amount !== null &&
      body.amount !== undefined &&
      Number.isFinite(body.amount);

    const row = this.billRepository.create({
      userId,
      name: body.name.trim(),
      description: body.description.trim(),
      dueDay: body.dueDay,
      amount: hasAmount ? body.amount!.toFixed(2) : null,
    });
    const saved = await this.billRepository.save(row);
    return MonthlyBillTemplateResponseDto.fromEntity(saved);
  }
}
