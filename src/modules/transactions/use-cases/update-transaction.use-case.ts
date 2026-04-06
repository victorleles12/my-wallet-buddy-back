import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';
import { UpdateTransactionRequestDto } from '../api/dto/update-transaction.request.dto';
import { TransactionResponseDto } from '../api/dto/transaction.response.dto';

@Injectable()
export class UpdateTransactionUseCase {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(
    transactionId: string,
    requesterUserId: string,
    body: UpdateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    const row = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });
    if (!row) {
      throw new NotFoundException('Transaction not found.');
    }
    if (row.userId !== requesterUserId) {
      throw new ForbiddenException(
        'Only the user who created this transaction can update it.',
      );
    }

    const familyGroupId = body.groupId ?? null;
    const isFamily = familyGroupId != null;

    if (isFamily) {
      const membership = await this.memberRepository.findOne({
        where: { userId: requesterUserId, familyGroupId },
      });
      if (!membership) {
        throw new BadRequestException(
          'You must belong to the group to use it for this transaction.',
        );
      }
    }

    row.type = body.type;
    row.amount = body.amount.toFixed(2);
    row.category = body.category;
    row.description = body.description;
    row.occurredOn = body.occurredOn.slice(0, 10);
    row.isFamily = isFamily;
    row.familyGroupId = familyGroupId;

    await this.transactionRepository.save(row);

    const full = await this.transactionRepository.findOne({
      where: { id: row.id },
      relations: { familyGroup: true },
    });
    return TransactionResponseDto.fromEntity(full!);
  }
}
