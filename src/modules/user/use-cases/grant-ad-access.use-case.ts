import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserAccessResponseDto } from '../api/dto/user-access.response.dto';

@Injectable()
export class GrantAdAccessUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async execute(userId: string, hours = 24): Promise<UserAccessResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const configuredGrantHours = Number(
      this.configService.get<string>('AD_REWARD_GRANT_HOURS') ?? '24',
    );
    const configuredCooldownHours = Number(
      this.configService.get<string>('AD_REWARD_COOLDOWN_HOURS') ?? '24',
    );
    const maxGrantHours = Number(
      this.configService.get<string>('AD_REWARD_MAX_GRANT_HOURS') ?? '168',
    );

    const fallbackGrantHours =
      Number.isFinite(configuredGrantHours) && configuredGrantHours > 0
        ? configuredGrantHours
        : 24;
    const safeMaxGrantHours =
      Number.isFinite(maxGrantHours) && maxGrantHours > 0 ? maxGrantHours : 168;
    const requestedHours = Number.isFinite(hours) ? hours : fallbackGrantHours;
    const safeHours = Math.max(1, Math.min(requestedHours, safeMaxGrantHours));
    const now = new Date();
    const cooldownHours =
      Number.isFinite(configuredCooldownHours) && configuredCooldownHours > 0
        ? configuredCooldownHours
        : fallbackGrantHours;

    if (safeHours > cooldownHours) {
      throw new BadRequestException(
        `Ad reward duration cannot exceed cooldown window (${cooldownHours}h).`,
      );
    }

    if (user.adUnlockUntil && user.adUnlockUntil > now) {
      const remainingMs = user.adUnlockUntil.getTime() - now.getTime();
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      throw new ConflictException(
        `Ad reward already active. Try again in about ${remainingHours} hour(s).`,
      );
    }

    const next = new Date(now.getTime() + safeHours * 60 * 60 * 1000);
    user.adUnlockUntil = next;

    const saved = await this.userRepository.save(user);
    return UserAccessResponseDto.fromEntity(saved);
  }
}
