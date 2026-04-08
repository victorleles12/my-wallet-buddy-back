import { ApiProperty } from '@nestjs/swagger';

export class RequestLoginCodeResponseDto {
  @ApiProperty({
    example:
      'Se as credenciais estiverem corretas, enviámos um código de 6 dígitos para o seu e-mail.',
  })
  message: string;
}
