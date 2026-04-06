import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { TransactionKind } from '@/domain/entities/transaction.entity';

export class CreateTransactionRequestDto {
  @ApiProperty({ enum: ['income', 'expense'] })
  @IsIn(['income', 'expense'])
  type: TransactionKind;

  @ApiProperty({ example: 99.9 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'food' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @ApiProperty({ example: 'Supermercado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: '2026-04-05' })
  @IsDateString()
  occurredOn: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'When set, the transaction is visible to all members of this group (you must belong to it). Omit for a personal transaction.',
  })
  @IsOptional()
  @IsUUID('4')
  groupId?: string;
}
