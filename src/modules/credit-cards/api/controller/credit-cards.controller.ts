import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateCreditCardRequestDto } from '../dto/create-credit-card.request.dto';
import { CreateCreditCardPurchaseRequestDto } from '../dto/create-credit-card-purchase.request.dto';
import { CreditCardDashboardResponseDto } from '../dto/credit-card-dashboard.response.dto';
import { CreditCardPurchaseResponseDto } from '../dto/credit-card-purchase.response.dto';
import { CreditCardResponseDto } from '../dto/credit-card.response.dto';
import { UpdateCreditCardPurchaseRequestDto } from '../dto/update-credit-card-purchase.request.dto';
import { UpdateCreditCardRequestDto } from '../dto/update-credit-card.request.dto';
import { CreateCreditCardUseCase } from '../../use-cases/create-credit-card.use-case';
import { CreateCreditCardPurchaseUseCase } from '../../use-cases/create-credit-card-purchase.use-case';
import { DeleteCreditCardUseCase } from '../../use-cases/delete-credit-card.use-case';
import { DeleteCreditCardPurchaseUseCase } from '../../use-cases/delete-credit-card-purchase.use-case';
import { GetCreditCardByIdUseCase } from '../../use-cases/get-credit-card-by-id.use-case';
import { GetCreditCardDashboardUseCase } from '../../use-cases/get-credit-card-dashboard.use-case';
import { ListCreditCardsUseCase } from '../../use-cases/list-credit-cards.use-case';
import { ListCreditCardPurchasesUseCase } from '../../use-cases/list-credit-card-purchases.use-case';
import { UpdateCreditCardUseCase } from '../../use-cases/update-credit-card.use-case';
import { UpdateCreditCardPurchaseUseCase } from '../../use-cases/update-credit-card-purchase.use-case';

type JwtUser = { userId: string; email: string };
type AuthedRequest = Request & { user: JwtUser };

@ApiBearerAuth('JWT-auth')
@ApiTags('credit-cards')
@Controller('credit-cards')
export class CreditCardsController {
  constructor(
    private readonly createCreditCard: CreateCreditCardUseCase,
    private readonly listCreditCards: ListCreditCardsUseCase,
    private readonly getCreditCardById: GetCreditCardByIdUseCase,
    private readonly updateCreditCard: UpdateCreditCardUseCase,
    private readonly deleteCreditCard: DeleteCreditCardUseCase,
    private readonly createPurchase: CreateCreditCardPurchaseUseCase,
    private readonly listPurchases: ListCreditCardPurchasesUseCase,
    private readonly updatePurchase: UpdateCreditCardPurchaseUseCase,
    private readonly deletePurchase: DeleteCreditCardPurchaseUseCase,
    private readonly dashboard: GetCreditCardDashboardUseCase,
  ) {}

  @Get('dashboard/summary')
  @ApiOperation({
    summary:
      'Resumo: projeção mensal, totais em aberto e data da última parcela pendente',
  })
  @ApiOkResponse({ type: CreditCardDashboardResponseDto })
  summary(@Req() req: AuthedRequest): Promise<CreditCardDashboardResponseDto> {
    return this.dashboard.execute(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um cartão' })
  @ApiCreatedResponse({ type: CreditCardResponseDto })
  createCard(
    @Req() req: AuthedRequest,
    @Body() body: CreateCreditCardRequestDto,
  ): Promise<CreditCardResponseDto> {
    return this.createCreditCard.execute(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar seus cartões' })
  @ApiOkResponse({ type: CreditCardResponseDto, isArray: true })
  listCards(@Req() req: AuthedRequest): Promise<CreditCardResponseDto[]> {
    return this.listCreditCards.execute(req.user.userId);
  }

  @Get(':cardId/purchases')
  @ApiOperation({ summary: 'Listar compras parceladas do cartão' })
  @ApiOkResponse({ type: CreditCardPurchaseResponseDto, isArray: true })
  listCardPurchases(
    @Req() req: AuthedRequest,
    @Param('cardId', ParseUUIDPipe) cardId: string,
  ): Promise<CreditCardPurchaseResponseDto[]> {
    return this.listPurchases.execute(req.user.userId, cardId);
  }

  @Post(':cardId/purchases')
  @ApiOperation({
    summary: 'Registrar compra parcelada (valor total, nº de parcelas, 1º vencimento)',
  })
  @ApiCreatedResponse({ type: CreditCardPurchaseResponseDto })
  createCardPurchase(
    @Req() req: AuthedRequest,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() body: CreateCreditCardPurchaseRequestDto,
  ): Promise<CreditCardPurchaseResponseDto> {
    return this.createPurchase.execute(req.user.userId, cardId, body);
  }

  @Patch(':cardId/purchases/:purchaseId')
  @ApiOperation({
    summary:
      'Atualizar compra (ex.: marcar parcelas pagas, corrigir valor ou datas)',
  })
  @ApiOkResponse({ type: CreditCardPurchaseResponseDto })
  updateCardPurchase(
    @Req() req: AuthedRequest,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Param('purchaseId', ParseUUIDPipe) purchaseId: string,
    @Body() body: UpdateCreditCardPurchaseRequestDto,
  ): Promise<CreditCardPurchaseResponseDto> {
    return this.updatePurchase.execute(
      req.user.userId,
      cardId,
      purchaseId,
      body,
    );
  }

  @Delete(':cardId/purchases/:purchaseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover registro de compra parcelada' })
  @ApiNoContentResponse()
  removePurchase(
    @Req() req: AuthedRequest,
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Param('purchaseId', ParseUUIDPipe) purchaseId: string,
  ): Promise<void> {
    return this.deletePurchase.execute(req.user.userId, cardId, purchaseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um cartão' })
  @ApiOkResponse({ type: CreditCardResponseDto })
  getCard(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CreditCardResponseDto> {
    return this.getCreditCardById.execute(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar nome/cor do cartão' })
  @ApiOkResponse({ type: CreditCardResponseDto })
  patchCard(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCreditCardRequestDto,
  ): Promise<CreditCardResponseDto> {
    return this.updateCreditCard.execute(id, req.user.userId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir cartão e compras associadas' })
  @ApiNoContentResponse()
  async removeCard(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteCreditCard.execute(id, req.user.userId);
  }
}
