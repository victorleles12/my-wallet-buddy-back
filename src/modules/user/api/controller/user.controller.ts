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
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../auth/decorators/public.decorator';
import { UserRole } from '@/domain/entities/user.entity';
import { CreateUserRequestDto } from '../dto/create.user.request.dto';
import { UpdateUserStatusRequestDto } from '../dto/update-user-status.request.dto';
import { UpdateUserRequestDto } from '../dto/update.user.request.dto';
import { UserResponseDto } from '../dto/user.response.dto';
import { CreateUserUseCase } from '../../use-cases/create.user.use-case';
import { DeleteUserUseCase } from '../../use-cases/delete.user.use-case';
import { GetUserByIdUseCase } from '../../use-cases/get.user.by.id.use-case';
import { ListUsersUseCase } from '../../use-cases/list.users.use-case';
import { UpdateUserStatusUseCase } from '../../use-cases/update-user-status.use-case';
import { UpdateUserUseCase } from '../../use-cases/update.user.use-case';
import { PaginationQueryDto } from '@/common/dto/pagination.query.dto';

type JwtUser = { userId: string; email: string; role: UserRole };
type AuthedRequest = Request & { user: JwtUser };

@ApiBearerAuth('JWT-auth')
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Create user (public — bootstrap first account)' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(body);
  }

  @Get()
  @ApiOperation({
    summary: 'List users (admin); non-admin receives only current user',
  })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  async list(
    @Req() req: AuthedRequest,
    @Query() query: PaginationQueryDto,
  ): Promise<UserResponseDto[]> {
    if (req.user.role === 'admin') {
      return this.listUsersUseCase.execute(query.limit, query.offset);
    }

    const me = await this.getUserByIdUseCase.execute(
      req.user.userId,
      req.user.userId,
    );
    return [me];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserResponseDto })
  getById(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.getUserByIdUseCase.execute(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Update profile fields (admin can update any user; user updates self)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute(
      id,
      req.user.userId,
      req.user.role,
      body,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update enabled status (admin only)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserResponseDto })
  updateStatus(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserStatusRequestDto,
  ): Promise<UserResponseDto> {
    return this.updateUserStatusUseCase.execute(
      id,
      req.user.role,
      body.enabled,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteUserUseCase.execute(id, req.user.userId, req.user.role);
  }
}
