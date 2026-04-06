import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';
import { CreateTransactionRequestDto } from '../api/dto/create-transaction.request.dto';
import { TransactionResponseDto } from '../api/dto/transaction.response.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly familyMemberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(
    userId: string,
    body: CreateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    const familyGroupId = body.groupId ?? null;
    const isFamily = familyGroupId != null;

    if (isFamily) {
      const membership = await this.familyMemberRepository.findOne({
        where: { userId, familyGroupId },
      });
      if (!membership) {
        throw new BadRequestException(
          'You must belong to the group to post a group transaction.',
        );
      }
    }

    const row = this.transactionRepository.create({
      userId,
      type: body.type,
      amount: body.amount.toFixed(2),
      category: body.category,
      description: body.description,
      occurredOn: body.occurredOn.slice(0, 10),
      isFamily,
      familyGroupId,
    });
    const saved = await this.transactionRepository.save(row);
    const full = await this.transactionRepository.findOne({
      where: { id: saved.id },
      relations: { familyGroup: true },
    });
    return TransactionResponseDto.fromEntity(full!);
  }
}
