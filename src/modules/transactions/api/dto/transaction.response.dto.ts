import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionEntity, TransactionKind } from '@/domain/entities/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ enum: ['income', 'expense'] })
  type: TransactionKind;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  category: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ example: '2026-04-05' })
  occurredOn: string;

  @ApiProperty()
  isFamily: boolean;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  familyGroupId: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  groupId: string | null;

  @ApiPropertyOptional({ nullable: true })
  groupName: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(
    entity: TransactionEntity,
    groupName?: string | null,
  ): TransactionResponseDto {
    const name =
      groupName ??
      (entity.familyGroup ? entity.familyGroup.name : null) ??
      null;
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type,
      amount: Number(entity.amount),
      category: entity.category,
      description: entity.description,
      occurredOn: entity.occurredOn,
      isFamily: entity.isFamily,
      familyGroupId: entity.familyGroupId,
      groupId: entity.familyGroupId,
      groupName: name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
