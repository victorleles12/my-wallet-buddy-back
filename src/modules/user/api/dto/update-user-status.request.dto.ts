import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusRequestDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;
}
