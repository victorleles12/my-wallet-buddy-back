import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateCreditCardPurchaseRequestDto {
  @ApiProperty({ example: 'Notebook' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 1200.0,
    description:
      'Parcelado: valor total. Recorrente: valor cobrado todo mês (ex.: assinatura).',
  })
  @Type(() => Number)
  @Min(0.01)
  totalAmount: number;

  @ApiPropertyOptional({
    description:
      'Assinatura/recorrente sem última parcela (ex.: Netflix). Quando true, ignore installmentsTotal.',
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    example: 12,
    description: 'Obrigatório quando isRecurring não é true',
  })
  @ValidateIf((o: CreateCreditCardPurchaseRequestDto) => o.isRecurring !== true)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  installmentsTotal?: number;

  @ApiProperty({
    example: '2026-05-10',
    description:
      'Parcelado: vencimento da 1ª parcela. Recorrente: referência do 1º mês de cobrança.',
  })
  @IsDateString()
  firstDueDate: string;
}
