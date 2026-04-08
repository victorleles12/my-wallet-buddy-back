import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';
import { CreateCreditCardRequestDto } from '../api/dto/create-credit-card.request.dto';
import { CreditCardResponseDto } from '../api/dto/credit-card.response.dto';

@Injectable()
export class CreateCreditCardUseCase {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly repo: Repository<CreditCardEntity>,
  ) {}

  async execute(
    userId: string,
    body: CreateCreditCardRequestDto,
  ): Promise<CreditCardResponseDto> {
    const row = this.repo.create({
      userId,
      name: body.name.trim(),
      color: body.color ?? null,
    });
    const saved = await this.repo.save(row);
    return CreditCardResponseDto.fromEntity(saved);
  }
}
