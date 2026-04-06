import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { GroupSummaryResponseDto } from '../api/dto/group-summary.response.dto';

@Injectable()
export class ListMyGroupsUseCase {
  constructor(
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
  ) {}

  async execute(userId: string): Promise<GroupSummaryResponseDto[]> {
    const rows = await this.memberRepository.find({
      where: { userId },
      relations: { group: true },
      order: { group: { createdAt: 'DESC' } },
    });
    return rows.map((r) =>
      GroupSummaryResponseDto.fromGroupAndRole(r.group, r.role),
    );
  }
}
