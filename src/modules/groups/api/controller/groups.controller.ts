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
import { AddMemberByEmailRequestDto } from '../dto/add-member-by-email.request.dto';
import { CreateGroupRequestDto } from '../dto/create-group.request.dto';
import { GroupDetailResponseDto } from '../dto/group-detail.response.dto';
import { GroupSummaryResponseDto } from '../dto/group-summary.response.dto';
import { UpdateGroupRequestDto } from '../dto/update-group.request.dto';
import { AddGroupMemberByEmailUseCase } from '../../use-cases/add-group-member-by-email.use-case';
import { CreateGroupUseCase } from '../../use-cases/create-group.use-case';
import { DeleteGroupUseCase } from '../../use-cases/delete-group.use-case';
import { GetGroupByIdUseCase } from '../../use-cases/get-group-by-id.use-case';
import { ListMyGroupsUseCase } from '../../use-cases/list-my-groups.use-case';
import { RemoveGroupMemberUseCase } from '../../use-cases/remove-group-member.use-case';
import { UpdateGroupUseCase } from '../../use-cases/update-group.use-case';
import { PaginationQueryDto } from '@/common/dto/pagination.query.dto';

type JwtUser = { userId: string; email: string };
type AuthedRequest = Request & { user: JwtUser };

@ApiBearerAuth('JWT-auth')
@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly listMyGroupsUseCase: ListMyGroupsUseCase,
    private readonly getGroupByIdUseCase: GetGroupByIdUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly deleteGroupUseCase: DeleteGroupUseCase,
    private readonly addGroupMemberByEmailUseCase: AddGroupMemberByEmailUseCase,
    private readonly removeGroupMemberUseCase: RemoveGroupMemberUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a group (you become the owner)' })
  @ApiCreatedResponse({ type: GroupSummaryResponseDto })
  create(
    @Req() req: AuthedRequest,
    @Body() body: CreateGroupRequestDto,
  ): Promise<GroupSummaryResponseDto> {
    return this.createGroupUseCase.execute(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List groups you belong to' })
  @ApiOkResponse({ type: GroupSummaryResponseDto, isArray: true })
  list(
    @Req() req: AuthedRequest,
    @Query() query: PaginationQueryDto,
  ): Promise<GroupSummaryResponseDto[]> {
    return this.listMyGroupsUseCase.execute(
      req.user.userId,
      query.limit,
      query.offset,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Group details and members' })
  @ApiOkResponse({ type: GroupDetailResponseDto })
  getById(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GroupDetailResponseDto> {
    return this.getGroupByIdUseCase.execute(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename group (owner only)' })
  @ApiOkResponse({ type: GroupDetailResponseDto })
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGroupRequestDto,
  ): Promise<GroupDetailResponseDto> {
    return this.updateGroupUseCase.execute(id, req.user.userId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete group (owner only)' })
  @ApiNoContentResponse()
  async remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteGroupUseCase.execute(id, req.user.userId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member by registered email' })
  @ApiOkResponse({ type: GroupDetailResponseDto })
  addMember(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AddMemberByEmailRequestDto,
  ): Promise<GroupDetailResponseDto> {
    return this.addGroupMemberByEmailUseCase.execute(id, req.user.userId, body);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Remove member (owner removes others; anyone can leave by passing their own user id)',
  })
  @ApiNoContentResponse()
  async removeMember(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.removeGroupMemberUseCase.execute(id, userId, req.user.userId);
  }
}
