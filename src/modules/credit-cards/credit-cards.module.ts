import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreditCardPurchaseEntity } from '@/domain/entities/credit-card-purchase.entity';
import { CreditCardsController } from './api/controller/credit-cards.controller';
import { CreateCreditCardUseCase } from './use-cases/create-credit-card.use-case';
import { CreateCreditCardPurchaseUseCase } from './use-cases/create-credit-card-purchase.use-case';
import { DeleteCreditCardUseCase } from './use-cases/delete-credit-card.use-case';
import { DeleteCreditCardPurchaseUseCase } from './use-cases/delete-credit-card-purchase.use-case';
import { GetCreditCardByIdUseCase } from './use-cases/get-credit-card-by-id.use-case';
import { GetCreditCardDashboardUseCase } from './use-cases/get-credit-card-dashboard.use-case';
import { ListCreditCardsUseCase } from './use-cases/list-credit-cards.use-case';
import { ListCreditCardPurchasesUseCase } from './use-cases/list-credit-card-purchases.use-case';
import { UpdateCreditCardUseCase } from './use-cases/update-credit-card.use-case';
import { UpdateCreditCardPurchaseUseCase } from './use-cases/update-credit-card-purchase.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([CreditCardEntity, CreditCardPurchaseEntity])],
  controllers: [CreditCardsController],
  providers: [
    CreateCreditCardUseCase,
    ListCreditCardsUseCase,
    GetCreditCardByIdUseCase,
    UpdateCreditCardUseCase,
    DeleteCreditCardUseCase,
    CreateCreditCardPurchaseUseCase,
    ListCreditCardPurchasesUseCase,
    UpdateCreditCardPurchaseUseCase,
    DeleteCreditCardPurchaseUseCase,
    GetCreditCardDashboardUseCase,
  ],
})
export class CreditCardsModule {}
