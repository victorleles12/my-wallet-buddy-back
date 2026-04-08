import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreditCardEntity } from '@/domain/entities/credit-card.entity';

export class CreditCardResponseDto {
  @ApiPropertyOptional({ format: 'uuid' })
  id: string;

  @ApiPropertyOptional({ format: 'uuid' })
  userId: string;

  name: string;

  @ApiPropertyOptional({ nullable: true })
  color: string | null;

  createdAt: Date;

  updatedAt: Date;

  static fromEntity(entity: CreditCardEntity): CreditCardResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      color: entity.color,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
