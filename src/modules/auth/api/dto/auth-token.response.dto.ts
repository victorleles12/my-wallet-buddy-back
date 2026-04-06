import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ example: 'bearer' })
  tokenType: string;

  @ApiProperty({ example: 86400, description: 'Seconds until expiration' })
  expiresIn: number;
}
