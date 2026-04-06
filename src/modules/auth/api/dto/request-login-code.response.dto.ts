import { ApiProperty } from '@nestjs/swagger';

export class RequestLoginCodeResponseDto {
  @ApiProperty({
    example:
      'If credentials are valid, a 6-digit code was generated. Check the server terminal (dev).',
  })
  message: string;
}
