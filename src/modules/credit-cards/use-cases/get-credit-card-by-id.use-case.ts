import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreditCardResponseDto } from '../api/dto/credit-card.response.dto';

@Injectable()
export class GetCreditCardByIdUseCase {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly repo: Repository<CreditCardEntity>,
  ) {}

  async execute(
    id: string,
    userId: string,
  ): Promise<CreditCardResponseDto> {
    const row = await this.repo.findOne({ where: { id, userId } });
    if (!row) {
      throw new NotFoundException('Cartão não encontrado');
    }
    return CreditCardResponseDto.fromEntity(row);
  }
}
