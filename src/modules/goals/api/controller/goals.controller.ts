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
import { AddGoalParticipantsRequestDto } from '../dto/add-goal-participants.request.dto';
import { CreateGoalItemRequestDto } from '../dto/create-goal-item.request.dto';
import { CreateGoalWithParticipantsRequestDto } from '../dto/create-goal-with-participants.request.dto';
import { GoalResponseDto } from '../dto/goal.response.dto';
import { UpdateGoalItemRequestDto } from '../dto/update-goal-item.request.dto';
import { UpdateGoalRequestDto } from '../dto/update-goal.request.dto';
import { UpdateMyContributionRequestDto } from '../dto/update-my-contribution.request.dto';
import { AddGoalParticipantsUseCase } from '../../use-cases/add-goal-participants.use-case';
import { CreateGoalItemUseCase } from '../../use-cases/create-goal-item.use-case';
import { CreateGoalWithParticipantsUseCase } from '../../use-cases/create-goal-with-participants.use-case';
import { DeleteGoalItemUseCase } from '../../use-cases/delete-goal-item.use-case';
import { DeleteGoalUseCase } from '../../use-cases/delete-goal.use-case';
import { GetGoalByIdUseCase } from '../../use-cases/get-goal-by-id.use-case';
import { ListGoalsForUserUseCase } from '../../use-cases/list-goals-for-user.use-case';
import { UpdateGoalItemUseCase } from '../../use-cases/update-goal-item.use-case';
import { UpdateGoalUseCase } from '../../use-cases/update-goal.use-case';
import { UpdateMyContributionUseCase } from '../../use-cases/update-my-contribution.use-case';

type JwtUser = { userId: string; email: string };
type AuthedRequest = Request & { user: JwtUser };

@ApiBearerAuth('JWT-auth')
@ApiTags('goals')
@Controller('goals')
export class GoalsController {
  constructor(
    private readonly createGoalWithParticipantsUseCase: CreateGoalWithParticipantsUseCase,
    private readonly listGoalsForUserUseCase: ListGoalsForUserUseCase,
    private readonly getGoalByIdUseCase: GetGoalByIdUseCase,
    private readonly addGoalParticipantsUseCase: AddGoalParticipantsUseCase,
    private readonly updateGoalUseCase: UpdateGoalUseCase,
    private readonly updateMyContributionUseCase: UpdateMyContributionUseCase,
    private readonly deleteGoalUseCase: DeleteGoalUseCase,
    private readonly createGoalItemUseCase: CreateGoalItemUseCase,
    private readonly updateGoalItemUseCase: UpdateGoalItemUseCase,
    private readonly deleteGoalItemUseCase: DeleteGoalItemUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Create a shared goal; creator is always a participant. Pass other user IDs in participantUserIds (e.g. trip with two people).',
  })
  @ApiCreatedResponse({ type: GoalResponseDto })
  create(
    @Req() req: AuthedRequest,
    @Body() body: CreateGoalWithParticipantsRequestDto,
  ): Promise<GoalResponseDto> {
    return this.createGoalWithParticipantsUseCase.execute(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List goals where the current user is a participant' })
  @ApiOkResponse({ type: GoalResponseDto, isArray: true })
  list(@Req() req: AuthedRequest): Promise<GoalResponseDto[]> {
    return this.listGoalsForUserUseCase.execute(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by id (must be a participant)' })
  @ApiOkResponse({ type: GoalResponseDto })
  getById(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GoalResponseDto> {
    return this.getGoalByIdUseCase.execute(id, req.user.userId);
  }

  @Post(':id/participants')
  @ApiOperation({
    summary: 'Add users to an existing goal (requester must already be a participant)',
  })
  @ApiOkResponse({ type: GoalResponseDto })
  addParticipants(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AddGoalParticipantsRequestDto,
  ): Promise<GoalResponseDto> {
    return this.addGoalParticipantsUseCase.execute(
      id,
      req.user.userId,
      body,
    );
  }

  @Post(':id/items')
  @ApiOperation({
    summary:
      'Add a planned cost line (e.g. flights, hotel). Any participant can add.',
  })
  @ApiOkResponse({ type: GoalResponseDto })
  addItem(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateGoalItemRequestDto,
  ): Promise<GoalResponseDto> {
    return this.createGoalItemUseCase.execute(id, req.user.userId, body);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Update a goal item (any participant)' })
  @ApiOkResponse({ type: GoalResponseDto })
  updateItem(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() body: UpdateGoalItemRequestDto,
  ): Promise<GoalResponseDto> {
    return this.updateGoalItemUseCase.execute(
      id,
      itemId,
      req.user.userId,
      body,
    );
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remove a goal item (any participant)' })
  @ApiOkResponse({ type: GoalResponseDto })
  removeItem(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<GoalResponseDto> {
    return this.deleteGoalItemUseCase.execute(id, itemId, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal metadata (creator only)' })
  @ApiOkResponse({ type: GoalResponseDto })
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGoalRequestDto,
  ): Promise<GoalResponseDto> {
    return this.updateGoalUseCase.execute(id, req.user.userId, body);
  }

  @Patch(':id/me/contribution')
  @ApiOperation({
    summary:
      'Set total amount the current user has saved (absolute value, e.g. bank balance for this goal — not a delta)',
  })
  @ApiOkResponse({ type: GoalResponseDto })
  updateMyContribution(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMyContributionRequestDto,
  ): Promise<GoalResponseDto> {
    return this.updateMyContributionUseCase.execute(
      id,
      req.user.userId,
      body,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete goal (creator only)' })
  @ApiNoContentResponse()
  async remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteGoalUseCase.execute(id, req.user.userId);
  }
}
