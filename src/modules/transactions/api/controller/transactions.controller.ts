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
import { CreateTransactionRequestDto } from '../dto/create-transaction.request.dto';
import { TransactionResponseDto } from '../dto/transaction.response.dto';
import { UpdateTransactionRequestDto } from '../dto/update-transaction.request.dto';
import { CreateTransactionUseCase } from '../../use-cases/create-transaction.use-case';
import { DeleteTransactionUseCase } from '../../use-cases/delete-transaction.use-case';
import { GetTransactionByIdUseCase } from '../../use-cases/get-transaction-by-id.use-case';
import { ListTransactionsForUserUseCase } from '../../use-cases/list-transactions-for-user.use-case';
import { UpdateTransactionUseCase } from '../../use-cases/update-transaction.use-case';

type JwtUser = { userId: string; email: string };
type AuthedRequest = Request & { user: JwtUser };

@ApiBearerAuth('JWT-auth')
@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly listTransactionsForUserUseCase: ListTransactionsForUserUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Create income or expense; pass groupId to share with all members of that group',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  create(
    @Req() req: AuthedRequest,
    @Body() body: CreateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    return this.createTransactionUseCase.execute(req.user.userId, body);
  }

  @Get()
  @ApiOperation({
    summary:
      'List transactions visible to you (personal: yours only; group: all from groups you belong to)',
  })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  list(@Req() req: AuthedRequest): Promise<TransactionResponseDto[]> {
    return this.listTransactionsForUserUseCase.execute(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one transaction if you are allowed to see it' })
  @ApiOkResponse({ type: TransactionResponseDto })
  getById(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    return this.getTransactionByIdUseCase.execute(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction (creator only)' })
  @ApiOkResponse({ type: TransactionResponseDto })
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    return this.updateTransactionUseCase.execute(id, req.user.userId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction (creator only)' })
  @ApiNoContentResponse()
  async remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteTransactionUseCase.execute(id, req.user.userId);
  }
}
