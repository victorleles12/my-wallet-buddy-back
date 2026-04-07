import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'ID token (JWT) devolvido pelo Google após o login OAuth',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
