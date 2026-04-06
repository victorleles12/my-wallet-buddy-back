import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateGroupRequestDto {
  @ApiProperty({ example: 'Família Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
