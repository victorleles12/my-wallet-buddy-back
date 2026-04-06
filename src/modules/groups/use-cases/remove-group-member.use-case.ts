import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';

@Injectable()
export class RemoveGroupMemberUseCase {
  constructor(
    @InjectRepository(FamilyGroupEntity)
    private readonly groupRepository: Repository<FamilyGroupEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(
    groupId: string,
    targetUserId: string,
    requesterUserId: string,
  ): Promise<void> {
    const requesterMembership = await this.memberRepository.findOne({
      where: { familyGroupId: groupId, userId: requesterUserId },
    });
    if (!requesterMembership) {
      throw new ForbiddenException('You are not a member of this group.');
    }

    const targetMembership = await this.memberRepository.findOne({
      where: { familyGroupId: groupId, userId: targetUserId },
    });
    if (!targetMembership) {
      throw new NotFoundException('Member not found in this group.');
    }

    if (targetUserId !== requesterUserId) {
      if (requesterMembership.role !== 'owner') {
        throw new ForbiddenException(
          'Only the group owner can remove other members.',
        );
      }
      if (targetMembership.role === 'owner') {
        throw new BadRequestException('Cannot remove the group owner.');
      }
    }

    if (targetUserId === requesterUserId && targetMembership.role === 'owner') {
      const allMembers = await this.memberRepository.find({
        where: { familyGroupId: groupId },
        order: { createdAt: 'ASC' },
      });
      const others = allMembers.filter((m) => m.userId !== requesterUserId);
      if (others.length === 0) {
        const group = await this.groupRepository.findOne({
          where: { id: groupId },
        });
        if (group) await this.groupRepository.remove(group);
        return;
      }
      const nextOwner = others[0];
      nextOwner.role = 'owner';
      await this.memberRepository.save(nextOwner);
    }

    await this.memberRepository.remove(targetMembership);
  }
}
