import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreditCardPurchaseEntity } from '@/domain/entities/credit-card-purchase.entity';
import {
  isRecurringPurchase,
  lastDueDateIso,
  nextDueDateIso,
  periodAmount,
  remainingInstallments,
} from '@/modules/credit-cards/credit-card-installment.util';

export class CreditCardPurchaseResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ format: 'uuid' })
  creditCardId: string;

  title: string;

  totalAmount: number;

  @ApiProperty({
    description:
      'true = assinatura mensal (valor em totalAmount é o valor por mês, sem última parcela)',
  })
  isRecurring: boolean;

  @ApiPropertyOptional({ nullable: true })
  installmentsTotal: number | null;

  @ApiPropertyOptional({ nullable: true })
  paidInstallments: number | null;

  @ApiProperty({ example: '2026-05-10' })
  firstDueDate: string;

  /** Valor da parcela ou valor mensal (recorrente). */
  @ApiProperty()
  installmentAmount: number;

  /** null = recorrente sem fim */
  @ApiPropertyOptional({ nullable: true })
  remainingInstallments: number | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-07-10' })
  nextDueDate: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2027-04-10' })
  lastDueDate: string | null;

  @ApiProperty()
  isFullyPaid: boolean;

  createdAt: Date;

  updatedAt: Date;

  static fromEntity(entity: CreditCardPurchaseEntity): CreditCardPurchaseResponseDto {
    const today = new Date().toISOString().slice(0, 10);
    const recurring = isRecurringPurchase(entity);
    const inst = periodAmount(entity);
    const rem = remainingForApi(entity);
    return {
      id: entity.id,
      userId: entity.userId,
      creditCardId: entity.creditCardId,
      title: entity.title,
      totalAmount: Number(entity.totalAmount),
      isRecurring: recurring,
      installmentsTotal: recurring ? null : entity.installmentsTotal,
      paidInstallments: recurring ? null : entity.paidInstallments,
      firstDueDate: entity.firstDueDate,
      installmentAmount: inst,
      remainingInstallments: rem,
      nextDueDate: nextDueDateIso(entity, today),
      lastDueDate: lastDueDateIso(entity),
      isFullyPaid: recurring ? false : remainingInstallments(entity) === 0,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

function remainingForApi(entity: CreditCardPurchaseEntity): number | null {
  if (isRecurringPurchase(entity)) return null;
  return remainingInstallments(entity);
}
