import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserAccessResponseDto } from '../api/dto/user-access.response.dto';
import { GetMyAccessUseCase } from './get-my-access.use-case';

/**
 * Ativação direta (sem Google Play). Desative em produção com
 * ALLOW_DIRECT_PREMIUM_ACTIVATION=false quando só quiser venda via Play Billing.
 */
@Injectable()
export class ActivatePremiumUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly config: ConfigService,
    private readonly getMyAccessUseCase: GetMyAccessUseCase,
  ) {}

  async execute(userId: string): Promise<UserAccessResponseDto> {
    const allow =
      this.config.get<string>('ALLOW_DIRECT_PREMIUM_ACTIVATION', 'true') ===
      'true';
    if (!allow) {
      throw new ForbiddenException(
        'Direct premium activation is disabled. Use Google Play subscription verification.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!user.isPremium) {
      user.isPremium = true;
      user.premiumSince = user.premiumSince ?? new Date();
    }

    const saved = await this.userRepository.save(user);
    this.getMyAccessUseCase.invalidateForUser(userId);
    return UserAccessResponseDto.fromEntity(saved);
  }
}
