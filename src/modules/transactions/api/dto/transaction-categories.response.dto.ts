import { ApiProperty } from '@nestjs/swagger';

export class TransactionCategoriesResponseDto {
  @ApiProperty({
    description:
      'Categorias distintas (case-insensitive) já usadas em despesas visíveis para o utilizador',
    type: [String],
    example: ['Alimentação', 'Transporte'],
  })
  expense: string[];

  @ApiProperty({
    description:
      'Categorias distintas (case-insensitive) já usadas em receitas visíveis para o utilizador',
    type: [String],
    example: ['Salário'],
  })
  income: string[];
}
