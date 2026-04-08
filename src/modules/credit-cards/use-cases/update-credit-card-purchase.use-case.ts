import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreditCardPurchaseEntity } from '@/domain/entities/credit-card-purchase.entity';
import { UpdateCreditCardPurchaseRequestDto } from '../api/dto/update-credit-card-purchase.request.dto';
import { CreditCardPurchaseResponseDto } from '../api/dto/credit-card-purchase.response.dto';

@Injectable()
export class UpdateCreditCardPurchaseUseCase {
  constructor(
    @InjectRepository(CreditCardPurchaseEntity)
    private readonly purchaseRepo: Repository<CreditCardPurchaseEntity>,
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
  ) {}

  async execute(
    userId: string,
    creditCardId: string,
    purchaseId: string,
    body: UpdateCreditCardPurchaseRequestDto,
  ): Promise<CreditCardPurchaseResponseDto> {
    const card = await this.cardRepo.findOne({
      where: { id: creditCardId, userId },
    });
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const row = await this.purchaseRepo.findOne({
      where: { id: purchaseId, creditCardId },
    });
    if (!row) {
      throw new NotFoundException('Compra não encontrada');
    }

    if (body.title !== undefined) row.title = body.title.trim();
    if (body.totalAmount !== undefined) {
      row.totalAmount = body.totalAmount.toFixed(2);
    }
    if (body.firstDueDate !== undefined) {
      row.firstDueDate = body.firstDueDate.slice(0, 10);
    }

    if (body.isRecurring === true) {
      row.isRecurring = true;
      row.installmentsTotal = null;
      row.paidInstallments = null;
    } else if (body.isRecurring === false) {
      row.isRecurring = false;
      if (body.installmentsTotal !== undefined) {
        if (
          !Number.isInteger(body.installmentsTotal) ||
          body.installmentsTotal < 1
        ) {
          throw new BadRequestException('Número de parcelas inválido');
        }
        row.installmentsTotal = body.installmentsTotal;
      }
      if (row.installmentsTotal == null) {
        throw new BadRequestException(
          'Defina o número de parcelas ao marcar como parcelado',
        );
      }
      if (row.paidInstallments == null) row.paidInstallments = 0;
    } else {
      if (!row.isRecurring && body.installmentsTotal !== undefined) {
        if (
          !Number.isInteger(body.installmentsTotal) ||
          body.installmentsTotal < 1
        ) {
          throw new BadRequestException('Número de parcelas inválido');
        }
        row.installmentsTotal = body.installmentsTotal;
      }
      if (!row.isRecurring && body.paidInstallments !== undefined) {
        if (!Number.isInteger(body.paidInstallments) || body.paidInstallments < 0) {
          throw new BadRequestException('Parcelas pagas inválidas');
        }
        row.paidInstallments = body.paidInstallments;
      }
    }

    if (row.isRecurring) {
      row.installmentsTotal = null;
      row.paidInstallments = null;
    } else {
      const maxPaid = row.installmentsTotal ?? 0;
      const paid = row.paidInstallments ?? 0;
      if (paid > maxPaid) {
        throw new BadRequestException(
          'Parcelas pagas não podem exceder o total de parcelas',
        );
      }
    }

    const saved = await this.purchaseRepo.save(row);
    return CreditCardPurchaseResponseDto.fromEntity(saved);
  }
}
