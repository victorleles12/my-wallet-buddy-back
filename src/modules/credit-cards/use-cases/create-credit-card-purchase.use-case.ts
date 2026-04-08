import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreditCardPurchaseEntity } from '@/domain/entities/credit-card-purchase.entity';
import { CreateCreditCardPurchaseRequestDto } from '../api/dto/create-credit-card-purchase.request.dto';
import { CreditCardPurchaseResponseDto } from '../api/dto/credit-card-purchase.response.dto';

@Injectable()
export class CreateCreditCardPurchaseUseCase {
  constructor(
    @InjectRepository(CreditCardPurchaseEntity)
    private readonly purchaseRepo: Repository<CreditCardPurchaseEntity>,
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
  ) {}

  async execute(
    userId: string,
    creditCardId: string,
    body: CreateCreditCardPurchaseRequestDto,
  ): Promise<CreditCardPurchaseResponseDto> {
    const card = await this.cardRepo.findOne({
      where: { id: creditCardId, userId },
    });
    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    const isRecurring = body.isRecurring === true;

    if (!isRecurring) {
      const installmentsTotal = body.installmentsTotal;
      if (
        installmentsTotal == null ||
        !Number.isInteger(installmentsTotal) ||
        installmentsTotal < 1
      ) {
        throw new BadRequestException('Número de parcelas inválido');
      }

      const row = this.purchaseRepo.create({
        userId,
        creditCardId,
        title: body.title.trim(),
        totalAmount: body.totalAmount.toFixed(2),
        isRecurring: false,
        installmentsTotal,
        paidInstallments: 0,
        firstDueDate: body.firstDueDate.slice(0, 10),
      });
      const saved = await this.purchaseRepo.save(row);
      return CreditCardPurchaseResponseDto.fromEntity(saved);
    }

    const row = this.purchaseRepo.create({
      userId,
      creditCardId,
      title: body.title.trim(),
      totalAmount: body.totalAmount.toFixed(2),
      isRecurring: true,
      installmentsTotal: null,
      paidInstallments: null,
      firstDueDate: body.firstDueDate.slice(0, 10),
    });
    const saved = await this.purchaseRepo.save(row);
    return CreditCardPurchaseResponseDto.fromEntity(saved);
  }
}
