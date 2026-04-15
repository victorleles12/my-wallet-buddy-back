import {
  BadRequestException,
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
  Put,
  Query,
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
import { CreateMonthlyBillRequestDto } from '../dto/create-monthly-bill.request.dto';
import { MonthlyBillTemplateResponseDto } from '../dto/monthly-bill-template.response.dto';
import { MonthlyBillsSummaryResponseDto } from '../dto/monthly-bills-summary.response.dto';
import { UpdateMonthlyBillRequestDto } from '../dto/update-monthly-bill.request.dto';
import { UpsertMonthlyBillStateRequestDto } from '../dto/upsert-monthly-bill-state.request.dto';
import { CreateMonthlyBillUseCase } from '../../use-cases/create-monthly-bill.use-case';
import { DeleteMonthlyBillUseCase } from '../../use-cases/delete-monthly-bill.use-case';
import { GetMonthlyBillsSummaryUseCase } from '../../use-cases/get-monthly-bills-summary.use-case';
import { UpdateMonthlyBillUseCase } from '../../use-cases/update-monthly-bill.use-case';
import { UpsertMonthlyBillStateUseCase } from '../../use-cases/upsert-monthly-bill-state.use-case';

type JwtUser = { userId: string; email: string };
type AuthedRequest = Request & { user: JwtUser };

const MONTH_QUERY = /^\d{4}-\d{2}$/;

@ApiBearerAuth('JWT-auth')
@ApiTags('monthly-bills')
@Controller('monthly-bills')
export class MonthlyBillsController {
  constructor(
    private readonly getMonthlyBillsSummaryUseCase: GetMonthlyBillsSummaryUseCase,
    private readonly createMonthlyBillUseCase: CreateMonthlyBillUseCase,
    private readonly updateMonthlyBillUseCase: UpdateMonthlyBillUseCase,
    private readonly deleteMonthlyBillUseCase: DeleteMonthlyBillUseCase,
    private readonly upsertMonthlyBillStateUseCase: UpsertMonthlyBillStateUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'List monthly bill templates and month-specific state (paid / hidden for that month)',
  })
  @ApiOkResponse({ type: MonthlyBillsSummaryResponseDto })
  summary(
    @Req() req: AuthedRequest,
    @Query('month') month: string,
  ): Promise<MonthlyBillsSummaryResponseDto> {
    if (!month || !MONTH_QUERY.test(month)) {
      throw new BadRequestException(
        'Query parameter "month" is required (format YYYY-MM).',
      );
    }
    return this.getMonthlyBillsSummaryUseCase.execute(req.user.userId, month);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recurring monthly bill reminder' })
  @ApiCreatedResponse({ type: MonthlyBillTemplateResponseDto })
  create(
    @Req() req: AuthedRequest,
    @Body() body: CreateMonthlyBillRequestDto,
  ): Promise<MonthlyBillTemplateResponseDto> {
    return this.createMonthlyBillUseCase.execute(req.user.userId, body);
  }

  @Put('state')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Upsert paid / hidden state for one bill and calendar month; removes row when both are false',
  })
  @ApiNoContentResponse()
  async upsertState(
    @Req() req: AuthedRequest,
    @Body() body: UpsertMonthlyBillStateRequestDto,
  ): Promise<void> {
    await this.upsertMonthlyBillStateUseCase.execute(req.user.userId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bill template (name, description, due day, amount)' })
  @ApiOkResponse({ type: MonthlyBillTemplateResponseDto })
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMonthlyBillRequestDto,
  ): Promise<MonthlyBillTemplateResponseDto> {
    return this.updateMonthlyBillUseCase.execute(id, req.user.userId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete template and all stored month states' })
  @ApiNoContentResponse()
  async remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteMonthlyBillUseCase.execute(id, req.user.userId);
  }
}
