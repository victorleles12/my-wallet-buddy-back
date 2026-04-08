import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreditCardResponseDto } from '../api/dto/credit-card.response.dto';

@Injectable()
export class ListCreditCardsUseCase {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly repo: Repository<CreditCardEntity>,
  ) {}

  async execute(userId: string): Promise<CreditCardResponseDto[]> {
    const rows = await this.repo.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    return rows.map((r) => CreditCardResponseDto.fromEntity(r));
  }
}
