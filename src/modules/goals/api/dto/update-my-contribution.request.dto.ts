import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateMyContributionRequestDto {
  @ApiProperty({
    example: 2500.5,
    description:
      'Total que este usuário tem hoje para o objetivo (valor absoluto na conta/reserva, não um incremento).',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentAmount: number;
}
