import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { GroupDetailResponseDto } from '../api/dto/group-detail.response.dto';

@Injectable()
export class GetGroupByIdUseCase {
  constructor(
    @InjectRepository(FamilyGroupEntity)
    private readonly groupRepository: Repository<FamilyGroupEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(
    groupId: string,
    requesterUserId: string,
  ): Promise<GroupDetailResponseDto> {
    const membership = await this.memberRepository.findOne({
      where: { familyGroupId: groupId, userId: requesterUserId },
    });
    if (!membership) {
      throw new ForbiddenException('You are not a member of this group.');
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: { members: { user: true } },
    });
    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    return GroupDetailResponseDto.fromEntity(group);
  }
}
