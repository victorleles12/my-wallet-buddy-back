import { ApiProperty } from '@nestjs/swagger';
import { MonthlyBillMonthStateResponseDto } from './monthly-bill-month-state.response.dto';
import { MonthlyBillTemplateResponseDto } from './monthly-bill-template.response.dto';

export class MonthlyBillsSummaryResponseDto {
  @ApiProperty({ type: [MonthlyBillTemplateResponseDto] })
  templates: MonthlyBillTemplateResponseDto[];

  @ApiProperty({ type: [MonthlyBillMonthStateResponseDto] })
  monthStates: MonthlyBillMonthStateResponseDto[];
}
