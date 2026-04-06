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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { CreateUserRequestDto } from '../dto/create.user.request.dto';
import { UpdateUserRequestDto } from '../dto/update.user.request.dto';
import { UserResponseDto } from '../dto/user.response.dto';
import { CreateUserUseCase } from '../../use-cases/create.user.use-case';
import { DeleteUserUseCase } from '../../use-cases/delete.user.use-case';
import { GetUserByIdUseCase } from '../../use-cases/get.user.by.id.use-case';
import { ListUsersUseCase } from '../../use-cases/list.users.use-case';
import { UpdateUserUseCase } from '../../use-cases/update.user.use-case';

@ApiBearerAuth('JWT-auth')
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create user (public — bootstrap first account)' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(body);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  list(): Promise<UserResponseDto[]> {
    return this.listUsersUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserResponseDto })
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.getUserByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }
}
