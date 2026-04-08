import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { UpdateCreditCardRequestDto } from '../api/dto/update-credit-card.request.dto';
import { CreditCardResponseDto } from '../api/dto/credit-card.response.dto';

@Injectable()
export class UpdateCreditCardUseCase {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly repo: Repository<CreditCardEntity>,
  ) {}

  async execute(
    id: string,
    userId: string,
    body: UpdateCreditCardRequestDto,
  ): Promise<CreditCardResponseDto> {
    const row = await this.repo.findOne({ where: { id, userId } });
    if (!row) {
      throw new NotFoundException('Cartão não encontrado');
    }
    if (body.name !== undefined) row.name = body.name.trim();
    if (body.color !== undefined) row.color = body.color;
    const saved = await this.repo.save(row);
    return CreditCardResponseDto.fromEntity(saved);
  }
}
