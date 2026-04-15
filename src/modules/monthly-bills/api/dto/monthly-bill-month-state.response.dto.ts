import { ApiProperty } from '@nestjs/swagger';

export class MonthlyBillMonthStateResponseDto {
  @ApiProperty({ format: 'uuid' })
  templateId: string;

  @ApiProperty()
  paid: boolean;

  @ApiProperty()
  skippedForMonth: boolean;
}
