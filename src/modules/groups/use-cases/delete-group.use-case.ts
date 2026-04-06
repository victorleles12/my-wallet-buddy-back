import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { TransactionEntity } from '@/domain/entities/transaction.entity';

@Injectable()
export class DeleteGroupUseCase {
  constructor(
    @InjectRepository(FamilyGroupEntity)
    private readonly groupRepository: Repository<FamilyGroupEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async execute(groupId: string, requesterUserId: string): Promise<void> {
    const membership = await this.memberRepository.findOne({
      where: { familyGroupId: groupId, userId: requesterUserId },
    });
    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException(
        'Only the group owner can delete the group.',
      );
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    await this.transactionRepository.update(
      { familyGroupId: groupId },
      { isFamily: false, familyGroupId: null },
    );

    await this.groupRepository.remove(group);
  }
}
