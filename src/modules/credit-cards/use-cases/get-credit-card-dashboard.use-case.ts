import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreditCardPurchaseEntity } from '@/domain/entities/credit-card-purchase.entity';
import {
  CreditCardDashboardCardDto,
  CreditCardDashboardMonthDto,
  CreditCardDashboardResponseDto,
} from '../api/dto/credit-card-dashboard.response.dto';
import {
  addMonthsIso,
  compareMonthKeys,
  installmentAmountFromTotal,
  isRecurringPurchase,
  lastDueDateIso,
  monthKeyFromIso,
  periodAmount,
  remainingInstallments,
  upcomingMonthKeys,
} from '@/modules/credit-cards/credit-card-installment.util';

@Injectable()
export class GetCreditCardDashboardUseCase {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
    @InjectRepository(CreditCardPurchaseEntity)
    private readonly purchaseRepo: Repository<CreditCardPurchaseEntity>,
  ) {}

  async execute(userId: string): Promise<CreditCardDashboardResponseDto> {
    const cards = await this.cardRepo.find({
      where: { userId },
      order: { name: 'ASC' },
    });

    const purchases = await this.purchaseRepo.find({
      where: { userId },
    });

    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);
    const projectionKeys = upcomingMonthKeys(now, 24);
    const keySet = new Set(projectionKeys);
    const monthTotals = new Map<string, number>();
    const monthInstallmentTotals = new Map<string, number>();
    const monthRecurringTotals = new Map<string, number>();
    for (const k of projectionKeys) {
      monthTotals.set(k, 0);
      monthInstallmentTotals.set(k, 0);
      monthRecurringTotals.set(k, 0);
    }

    let totalOutstandingApprox = 0;
    let recurringMonthlyTotal = 0;
    let globalLast: string | null = null;

    for (const p of purchases) {
      if (isRecurringPurchase(p)) {
        recurringMonthlyTotal += periodAmount(p);
        const startMk = monthKeyFromIso(p.firstDueDate);
        const amt = periodAmount(p);
        for (const mk of projectionKeys) {
          if (compareMonthKeys(mk, startMk) >= 0) {
            monthTotals.set(mk, (monthTotals.get(mk) ?? 0) + amt);
            monthRecurringTotals.set(
              mk,
              (monthRecurringTotals.get(mk) ?? 0) + amt,
            );
          }
        }
        continue;
      }

      const inst = installmentAmountFromTotal(
        p.totalAmount,
        p.installmentsTotal ?? 0,
      );
      const rem = remainingInstallments(p);
      totalOutstandingApprox += inst * rem;

      if (rem > 0) {
        const last = lastDueDateIso(p);
        if (last && (!globalLast || last > globalLast)) {
          globalLast = last;
        }
      }

      for (let i = p.paidInstallments ?? 0; i < (p.installmentsTotal ?? 0); i++) {
        const due = addMonthsIso(p.firstDueDate, i);
        const mk = monthKeyFromIso(due);
        if (keySet.has(mk)) {
          monthTotals.set(mk, (monthTotals.get(mk) ?? 0) + inst);
          monthInstallmentTotals.set(
            mk,
            (monthInstallmentTotals.get(mk) ?? 0) + inst,
          );
        }
      }
    }

    const thisMonthKey = monthKeyFromIso(todayIso);
    const projectionIndexByMonth = new Map<string, number>();
    projectionKeys.forEach((mk, idx) => projectionIndexByMonth.set(mk, idx));

    const purchasesByCard = new Map<string, CreditCardPurchaseEntity[]>();
    for (const p of purchases) {
      const list = purchasesByCard.get(p.creditCardId);
      if (list) {
        list.push(p);
      } else {
        purchasesByCard.set(p.creditCardId, [p]);
      }
    }

    const cardDtos: CreditCardDashboardCardDto[] = cards.map((c) => {
      const cardPurchases = purchasesByCard.get(c.id) ?? [];
      let outstandingApprox = 0;
      let recurringMonthlyApprox = 0;
      let lastOpen: string | null = null;
      let dueThisMonth = 0;

      for (const p of cardPurchases) {
        if (isRecurringPurchase(p)) {
          const amt = periodAmount(p);
          recurringMonthlyApprox += amt;
          if (compareMonthKeys(thisMonthKey, monthKeyFromIso(p.firstDueDate)) >= 0) {
            dueThisMonth += amt;
          }
          continue;
        }

        const inst = installmentAmountFromTotal(
          p.totalAmount,
          p.installmentsTotal ?? 0,
        );
        const rem = remainingInstallments(p);
        outstandingApprox += inst * rem;

        if (rem > 0) {
          const ld = lastDueDateIso(p);
          if (ld && (!lastOpen || ld > lastOpen)) lastOpen = ld;
        }
        const totalInstallments = p.installmentsTotal ?? 0;
        const paidInstallments = p.paidInstallments ?? 0;
        const firstDueMonth = monthKeyFromIso(p.firstDueDate);
        const firstDueIdx = projectionIndexByMonth.get(firstDueMonth);
        const thisMonthIdx = projectionIndexByMonth.get(thisMonthKey);
        if (firstDueIdx == null || thisMonthIdx == null) continue;
        const installmentOffsetInThisMonth = thisMonthIdx - firstDueIdx;
        if (
          installmentOffsetInThisMonth >= paidInstallments &&
          installmentOffsetInThisMonth < totalInstallments
        ) {
          dueThisMonth += inst;
        }
      }

      return {
        id: c.id,
        name: c.name,
        color: c.color,
        outstandingApprox: Math.round(outstandingApprox * 100) / 100,
        recurringMonthlyApprox: Math.round(recurringMonthlyApprox * 100) / 100,
        dueThisCalendarMonth: Math.round(dueThisMonth * 100) / 100,
        lastOpenInstallmentDate: lastOpen,
      };
    });

    const monthlyProjection: CreditCardDashboardMonthDto[] = projectionKeys.map(
      (month) => ({
        month,
        totalDue: Math.round((monthTotals.get(month) ?? 0) * 100) / 100,
        installmentDue:
          Math.round((monthInstallmentTotals.get(month) ?? 0) * 100) / 100,
        recurringDue:
          Math.round((monthRecurringTotals.get(month) ?? 0) * 100) / 100,
      }),
    );

    return {
      cards: cardDtos,
      monthlyProjection,
      globalLastDebtDate: globalLast,
      totalOutstandingApprox: Math.round(totalOutstandingApprox * 100) / 100,
      recurringMonthlyTotal: Math.round(recurringMonthlyTotal * 100) / 100,
    };
  }
}
