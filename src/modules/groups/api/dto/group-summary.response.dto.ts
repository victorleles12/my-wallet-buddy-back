import { ApiProperty } from '@nestjs/swagger';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { GroupMemberRole } from '@/domain/entities/family-group-member.entity';

export class GroupSummaryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'uuid' })
  createdByUserId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ enum: ['owner', 'member'] })
  myRole: GroupMemberRole;

  static fromGroupAndRole(
    group: FamilyGroupEntity,
    myRole: GroupMemberRole,
  ): GroupSummaryResponseDto {
    return {
      id: group.id,
      name: group.name,
      createdByUserId: group.createdByUserId,
      createdAt: group.createdAt,
      myRole,
    };
  }
}
