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

  async execute(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<GroupSummaryResponseDto[]> {
    const rows = await this.memberRepository
      .createQueryBuilder('m')
      .innerJoin('m.group', 'g')
      .where('m.user_id = :userId', { userId })
      .orderBy('g.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .select([
        'm.role AS m_role',
        'g.id AS g_id',
        'g.name AS g_name',
        'g.created_by_user_id AS g_created_by_user_id',
        'g.created_at AS g_created_at',
      ])
      .getRawMany<{
        m_role: 'owner' | 'member';
        g_id: string;
        g_name: string;
        g_created_by_user_id: string;
        g_created_at: Date;
      }>();

    return rows.map((r) => ({
      id: r.g_id,
      name: r.g_name,
      createdByUserId: r.g_created_by_user_id,
      createdAt: r.g_created_at,
      myRole: r.m_role,
    }));
  }
}
