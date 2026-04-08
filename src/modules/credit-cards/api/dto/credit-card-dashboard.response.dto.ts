import { ApiProperty } from '@nestjs/swagger';

export class CreditCardDashboardCardDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  name: string;

  @ApiProperty({ nullable: true })
  color: string | null;

  /** Soma do que ainda falta pagar só nas compras parceladas (parcelas restantes × valor da parcela) */
  @ApiProperty()
  outstandingApprox: number;

  /** Soma dos valores mensais de assinaturas/recorrentes neste cartão */
  @ApiProperty()
  recurringMonthlyApprox: number;

  /** Soma das parcelas deste mês (parcelado + recorrente ativo neste mês) */
  @ApiProperty()
  dueThisCalendarMonth: number;

  /** Data da última parcela ainda pendente (só parcelado; null se só recorrente ou nada em aberto) */
  @ApiProperty({ nullable: true, example: '2027-04-10' })
  lastOpenInstallmentDate: string | null;
}

export class CreditCardDashboardMonthDto {
  @ApiProperty({ example: '2026-05' })
  month: string;

  @ApiProperty({
    description:
      'Total no mês: parcelas com vencimento naquele mês + assinaturas recorrentes já iniciadas',
  })
  totalDue: number;
}

export class CreditCardDashboardResponseDto {
  @ApiProperty({ type: [CreditCardDashboardCardDto] })
  cards: CreditCardDashboardCardDto[];

  @ApiProperty({
    type: [CreditCardDashboardMonthDto],
    description: 'Projeção mês a mês (próximos 24 meses)',
  })
  monthlyProjection: CreditCardDashboardMonthDto[];

  /** Última parcela de compras parceladas ainda em aberto (ignora recorrente) */
  @ApiProperty({ nullable: true, example: '2027-08-10' })
  globalLastDebtDate: string | null;

  @ApiProperty({
    description:
      'Total aproximado em aberto só no parcelado (soma das parcelas restantes × valor)',
  })
  totalOutstandingApprox: number;

  /** Soma dos valores mensais de todas as assinaturas/recorrentes */
  @ApiProperty()
  recurringMonthlyTotal: number;
}
