import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { CreateGroupRequestDto } from '../api/dto/create-group.request.dto';
import { GroupSummaryResponseDto } from '../api/dto/group-summary.response.dto';

@Injectable()
export class CreateGroupUseCase {
  constructor(
    @InjectRepository(FamilyGroupEntity)
    private readonly groupRepository: Repository<FamilyGroupEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(
    userId: string,
    body: CreateGroupRequestDto,
  ): Promise<GroupSummaryResponseDto> {
    const group = await this.groupRepository.save(
      this.groupRepository.create({
        name: body.name.trim(),
        createdByUserId: userId,
      }),
    );
    await this.memberRepository.save(
      this.memberRepository.create({
        familyGroupId: group.id,
        userId,
        role: 'owner',
      }),
    );
    return GroupSummaryResponseDto.fromGroupAndRole(group, 'owner');
  }
}
