import { ApiProperty } from '@nestjs/swagger';
import { GroupMemberRole } from '@/domain/entities/family-group-member.entity';

export class GroupMemberResponseDto {
  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: ['owner', 'member'] })
  role: GroupMemberRole;
}
