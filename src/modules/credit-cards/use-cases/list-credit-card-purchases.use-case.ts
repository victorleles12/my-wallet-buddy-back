import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreditCardPurchaseEntity } from '@/domain/entities/credit-card-purchase.entity';
import { CreditCardPurchaseResponseDto } from '../api/dto/credit-card-purchase.response.dto';

@Injectable()
export class ListCreditCardPurchasesUseCase {
  constructor(
    @InjectRepository(CreditCardPurchaseEntity)
    private readonly purchaseRepo: Repository<CreditCardPurchaseEntity>,
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
  ) {}

  async execute(
    userId: string,
    creditCardId: string,
  ): Promise<CreditCardPurchaseResponseDto[]> {
    const card = await this.cardRepo.findOne({
      where: { id: creditCardId, userId },
    });
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const rows = await this.purchaseRepo.find({
      where: { creditCardId },
      order: { firstDueDate: 'DESC', createdAt: 'DESC' },
    });
    return rows.map((r) => CreditCardPurchaseResponseDto.fromEntity(r));
  }
}
