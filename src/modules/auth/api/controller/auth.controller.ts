import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { AuthTokenResponseDto } from '../dto/auth-token.response.dto';
import { RequestLoginCodeDto } from '../dto/request-login-code.dto';
import { RequestLoginCodeResponseDto } from '../dto/request-login-code.response.dto';
import { VerifyLoginCodeDto } from '../dto/verify-login-code.dto';
import { RequestLoginCodeUseCase } from '../../use-cases/request-login-code.use-case';
import { VerifyLoginCodeUseCase } from '../../use-cases/verify-login-code.use-case';

@Public()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly requestLoginCodeUseCase: RequestLoginCodeUseCase,
    private readonly verifyLoginCodeUseCase: VerifyLoginCodeUseCase,
  ) {}

  @Post('login/request-code')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary:
      'Step 1: validate email/password and issue a 6-digit code (logged in server terminal, dev)',
  })
  @ApiOkResponse({ type: RequestLoginCodeResponseDto })
  requestCode(
    @Body() body: RequestLoginCodeDto,
  ): Promise<RequestLoginCodeResponseDto> {
    return this.requestLoginCodeUseCase.execute(body);
  }

  @Post('login/verify')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Step 2: validate 6-digit code and return JWT' })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  verify(@Body() body: VerifyLoginCodeDto): Promise<AuthTokenResponseDto> {
    return this.verifyLoginCodeUseCase.execute(body);
  }
}
