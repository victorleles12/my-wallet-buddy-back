import { ApiProperty } from '@nestjs/swagger';
import { GoalEntity } from '@/domain/entities/goal.entity';
import { GoalItemEntity } from '@/domain/entities/goal-item.entity';
import { GoalParticipantEntity } from '@/domain/entities/goal-participant.entity';

export class GoalParticipantResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  currentAmount: number;

  static fromParticipant(p: GoalParticipantEntity): GoalParticipantResponseDto {
    const dto = new GoalParticipantResponseDto();
    dto.userId = p.userId;
    dto.email = p.user?.email ?? '';
    dto.firstName = p.user?.firstName ?? '';
    dto.lastName = p.user?.lastName ?? '';
    dto.currentAmount = Number(p.currentAmount);
    return dto;
  }
}

export class GoalItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Passagens' })
  label: string;

  @ApiProperty({ example: 3200.5 })
  amount: number;

  static fromEntity(i: GoalItemEntity): GoalItemResponseDto {
    const dto = new GoalItemResponseDto();
    dto.id = i.id;
    dto.label = i.label;
    dto.amount = Number(i.amount);
    return dto;
  }
}

export class GoalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  targetAmount: number;

  @ApiProperty()
  deadline: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  createdByUserId: string;

  @ApiProperty({ description: 'Quando o objetivo foi criado (ISO 8601).' })
  createdAt: string;

  @ApiProperty({
    description: 'Soma do que todos os participantes já juntaram.',
  })
  totalSaved: number;

  @ApiProperty({ type: [GoalParticipantResponseDto] })
  participants: GoalParticipantResponseDto[];

  @ApiProperty({
    type: [GoalItemResponseDto],
    description: 'Custos planejados (ex.: passagens, hotel).',
  })
  items: GoalItemResponseDto[];

  static fromEntity(goal: GoalEntity): GoalResponseDto {
    const dto = new GoalResponseDto();
    dto.id = goal.id;
    dto.name = goal.name;
    dto.targetAmount = Number(goal.targetAmount);
    dto.deadline = goal.deadline;
    dto.icon = goal.icon;
    dto.createdByUserId = goal.createdByUserId;
    dto.createdAt = goal.createdAt.toISOString();
    const parts = goal.participants ?? [];
    dto.totalSaved = parts.reduce((s, p) => s + Number(p.currentAmount), 0);
    dto.participants = parts.map((p) =>
      GoalParticipantResponseDto.fromParticipant(p),
    );
    const rawItems = goal.items ?? [];
    const sorted = [...rawItems].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.id.localeCompare(b.id);
    });
    dto.items = sorted.map((i) => GoalItemResponseDto.fromEntity(i));
    return dto;
  }
}
