import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';
import { TransactionResponseDto } from '../api/dto/transaction.response.dto';

@Injectable()
export class GetTransactionByIdUseCase {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(
    transactionId: string,
    requesterUserId: string,
  ): Promise<TransactionResponseDto> {
    const row = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: { familyGroup: true },
    });
    if (!row) {
      throw new NotFoundException('Transaction not found.');
    }

    if (!row.isFamily) {
      if (row.userId !== requesterUserId) {
        throw new ForbiddenException('You cannot access this transaction.');
      }
    } else {
      if (!row.familyGroupId) {
        throw new ForbiddenException('You cannot access this transaction.');
      }
      const membership = await this.memberRepository.findOne({
        where: {
          userId: requesterUserId,
          familyGroupId: row.familyGroupId,
        },
      });
      if (!membership) {
        throw new ForbiddenException('You cannot access this transaction.');
      }
    }

    return TransactionResponseDto.fromEntity(row);
  }
}
