import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MonthlyBillMonthStateEntity } from '@/domain/entities/monthly-bill-month-state.entity';
import { MonthlyBillEntity } from '@/domain/entities/monthly-bill.entity';
import { MonthlyBillMonthStateResponseDto } from '../api/dto/monthly-bill-month-state.response.dto';
import { MonthlyBillTemplateResponseDto } from '../api/dto/monthly-bill-template.response.dto';
import { MonthlyBillsSummaryResponseDto } from '../api/dto/monthly-bills-summary.response.dto';

@Injectable()
export class GetMonthlyBillsSummaryUseCase {
  constructor(
    @InjectRepository(MonthlyBillEntity)
    private readonly billRepository: Repository<MonthlyBillEntity>,
    @InjectRepository(MonthlyBillMonthStateEntity)
    private readonly stateRepository: Repository<MonthlyBillMonthStateEntity>,
  ) {}

  async execute(
    userId: string,
    month: string,
  ): Promise<MonthlyBillsSummaryResponseDto> {
    const templates = await this.billRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const ids = templates.map((t) => t.id);
    const states =
      ids.length === 0
        ? []
        : await this.stateRepository.find({
            where: { month, monthlyBillId: In(ids) },
          });

    const monthStates: MonthlyBillMonthStateResponseDto[] = states.map((s) => ({
      templateId: s.monthlyBillId,
      paid: s.paid,
      skippedForMonth: s.skippedForMonth,
    }));

    return {
      templates: templates.map(MonthlyBillTemplateResponseDto.fromEntity),
      monthStates,
    };
  }
}
