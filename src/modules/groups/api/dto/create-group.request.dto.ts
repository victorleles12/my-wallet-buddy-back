import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGroupRequestDto {
  @ApiProperty({ example: 'Casa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
