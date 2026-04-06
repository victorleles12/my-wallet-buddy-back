import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class AddMemberByEmailRequestDto {
  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;
}
