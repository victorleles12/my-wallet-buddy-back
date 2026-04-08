import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateCreditCardPurchaseRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description:
      'Quantas parcelas já foram pagas (apenas quando não é recorrente)',
  })
  @ValidateIf((o: UpdateCreditCardPurchaseRequestDto) => o.isRecurring !== true)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  paidInstallments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Min(0.01)
  totalAmount?: number;

  @ApiPropertyOptional()
  @ValidateIf((o: UpdateCreditCardPurchaseRequestDto) => o.isRecurring !== true)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  installmentsTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  firstDueDate?: string;
}
