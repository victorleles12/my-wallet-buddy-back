import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MonthlyBillEntity } from '@/domain/entities/monthly-bill.entity';

export class MonthlyBillTemplateResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ minimum: 1, maximum: 31 })
  dueDay: number;

  @ApiPropertyOptional({ nullable: true })
  amount: number | null;

  @ApiProperty({ example: '2026-04-14T12:00:00.000Z' })
  createdAt: string;

  static fromEntity(e: MonthlyBillEntity): MonthlyBillTemplateResponseDto {
    return {
      id: e.id,
      name: e.name,
      description: e.description ?? '',
      dueDay: e.dueDay,
      amount: e.amount == null ? null : Number(e.amount),
      createdAt: e.createdAt.toISOString(),
    };
  }
}
