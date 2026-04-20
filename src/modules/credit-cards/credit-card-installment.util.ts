import { CreditCardPurchaseEntity } from '@/domain/entities/credit-card-purchase.entity';

/** ISO date yyyy-mm-dd, adds calendar months in UTC. */
export function addMonthsIso(isoDate: string, months: number): string {
  const s = isoDate.slice(0, 10);
  const [y, m, d] = s.split('-').map((x) => Number(x));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCMonth(dt.getUTCMonth() + months);
  return dt.toISOString().slice(0, 10);
}

export function isRecurringPurchase(p: CreditCardPurchaseEntity): boolean {
  return p.isRecurring === true;
}

/** Crédito à vista no cartão: valor integral na fatura do mês da primeira data (1 parcela). */
export function isSinglePaymentPurchase(p: CreditCardPurchaseEntity): boolean {
  return !isRecurringPurchase(p) && (p.installmentsTotal ?? 0) === 1;
}

/** Parcela (parcelado) ou valor mensal (recorrente). */
export function periodAmount(p: CreditCardPurchaseEntity): number {
  if (isRecurringPurchase(p)) {
    return Math.round(Number(p.totalAmount) * 100) / 100;
  }
  const n = p.installmentsTotal ?? 0;
  return installmentAmountFromTotal(p.totalAmount, n);
}

export function installmentAmountFromTotal(total: string, n: number): number {
  if (n < 1) return 0;
  return Math.round((Number(total) / n) * 100) / 100;
}

export function remainingInstallments(p: CreditCardPurchaseEntity): number {
  if (isRecurringPurchase(p)) return 0;
  const total = p.installmentsTotal ?? 0;
  const paid = p.paidInstallments ?? 0;
  return Math.max(0, total - paid);
}

/** Próxima data de cobrança para recorrente (dia do mês alinhado a firstDue, ≥ hoje). */
export function nextRecurringDueIso(firstDue: string, todayIso: string): string {
  let d = firstDue.slice(0, 10);
  const ref = todayIso.slice(0, 10);
  if (d >= ref) return d;
  let guard = 0;
  while (d < ref && guard < 1200) {
    d = addMonthsIso(d, 1);
    guard += 1;
  }
  return d;
}

export function nextDueDateIso(
  p: CreditCardPurchaseEntity,
  todayIso: string,
): string | null {
  if (isRecurringPurchase(p)) {
    return nextRecurringDueIso(p.firstDueDate, todayIso);
  }
  const total = p.installmentsTotal ?? 0;
  const paid = p.paidInstallments ?? 0;
  if (paid >= total) return null;
  return addMonthsIso(p.firstDueDate, paid);
}

export function lastDueDateIso(p: CreditCardPurchaseEntity): string | null {
  if (isRecurringPurchase(p)) return null;
  const total = p.installmentsTotal ?? 1;
  return addMonthsIso(p.firstDueDate, total - 1);
}

/** yyyy-mm for grouping installments in the calendar month of each due date */
export function monthKeyFromIso(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function compareMonthKeys(a: string, b: string): number {
  return a.localeCompare(b);
}

export function upcomingMonthKeys(from: Date, count: number): string[] {
  const keys: string[] = [];
  const y = from.getUTCFullYear();
  const m0 = from.getUTCMonth();
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(y, m0 + i, 1));
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    keys.push(`${d.getUTCFullYear()}-${mm}`);
  }
  return keys;
}
