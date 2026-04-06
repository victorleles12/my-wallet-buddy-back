import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { UpdateGroupRequestDto } from '../api/dto/update-group.request.dto';
import { GroupDetailResponseDto } from '../api/dto/group-detail.response.dto';

@Injectable()
export class UpdateGroupUseCase {
  constructor(
    @InjectRepository(FamilyGroupEntity)
    private readonly groupRepository: Repository<FamilyGroupEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(
    groupId: string,
    requesterUserId: string,
    body: UpdateGroupRequestDto,
  ): Promise<GroupDetailResponseDto> {
    const membership = await this.memberRepository.findOne({
      where: { familyGroupId: groupId, userId: requesterUserId },
    });
    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException(
        'Only the group owner can update the group.',
      );
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    group.name = body.name.trim();
    await this.groupRepository.save(group);

    const full = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: { members: { user: true } },
    });
    return GroupDetailResponseDto.fromEntity(full!);
  }
}
