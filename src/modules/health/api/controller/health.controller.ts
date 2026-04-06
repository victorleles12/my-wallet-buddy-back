import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';

@Public()
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    schema: {
      example: { status: 'ok' },
      properties: { status: { type: 'string', example: 'ok' } },
    },
  })
  check(): { status: string } {
    return { status: 'ok' };
  }
}
