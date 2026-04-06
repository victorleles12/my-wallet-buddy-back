import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateGoalItemRequestDto {
  @ApiProperty({ example: 'Passagens aéreas' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  label: string;

  @ApiProperty({ example: 4500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;
}
