import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreditCardPurchaseEntity } from '@/domain/entities/credit-card-purchase.entity';

@Injectable()
export class DeleteCreditCardPurchaseUseCase {
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
  ): Promise<void> {
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

    await this.purchaseRepo.remove(row);
  }
}
