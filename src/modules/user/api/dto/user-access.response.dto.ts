import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserEntity } from '@/domain/entities/user.entity';

export class UserAccessResponseDto {
  @ApiProperty()
  isPremium: boolean;

  @ApiProperty()
  hasAccess: boolean;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  premiumSince: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  adUnlockUntil: Date | null;

  static fromEntity(entity: UserEntity): UserAccessResponseDto {
    const now = Date.now();
    const adUnlockUntil = entity.adUnlockUntil;
    const hasAdAccess = !!adUnlockUntil && adUnlockUntil.getTime() > now;
    return {
      isPremium: entity.isPremium,
      hasAccess: entity.isPremium || hasAdAccess,
      premiumSince: entity.premiumSince,
      adUnlockUntil: entity.adUnlockUntil,
    };
  }
}
