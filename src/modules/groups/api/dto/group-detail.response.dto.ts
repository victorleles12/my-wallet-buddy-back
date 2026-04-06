import { ApiProperty } from '@nestjs/swagger';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';
import { GroupMemberResponseDto } from './group-member.response.dto';

export class GroupDetailResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'uuid' })
  createdByUserId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: GroupMemberResponseDto, isArray: true })
  members: GroupMemberResponseDto[];

  static fromEntity(group: FamilyGroupEntity): GroupDetailResponseDto {
    const members = (group.members ?? [])
      .filter((m) => m.user)
      .map((m) => ({
        userId: m.user.id,
        email: m.user.email,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        role: m.role,
      }));
    return {
      id: group.id,
      name: group.name,
      createdByUserId: group.createdByUserId,
      createdAt: group.createdAt,
      members,
    };
  }
}
