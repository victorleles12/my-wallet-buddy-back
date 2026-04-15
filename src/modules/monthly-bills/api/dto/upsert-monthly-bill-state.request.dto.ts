import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID, Matches } from 'class-validator';

export class UpsertMonthlyBillStateRequestDto {
  @ApiProperty({ example: '2026-04' })
  @Matches(/^\d{4}-\d{2}$/)
  month: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  templateId: string;

  @ApiProperty()
  @IsBoolean()
  paid: boolean;

  @ApiProperty()
  @IsBoolean()
  skippedForMonth: boolean;
}
