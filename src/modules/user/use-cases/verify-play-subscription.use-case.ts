import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserAccessResponseDto } from '../api/dto/user-access.response.dto';
import { GooglePlaySubscriptionService } from '../services/google-play-subscription.service';
import { GetMyAccessUseCase } from './get-my-access.use-case';

@Injectable()
export class VerifyPlaySubscriptionUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly googlePlay: GooglePlaySubscriptionService,
    private readonly getMyAccessUseCase: GetMyAccessUseCase,
  ) {}

  async execute(
    userId: string,
    dto: {
      packageName: string;
      productId: string;
      purchaseToken: string;
    },
  ): Promise<UserAccessResponseDto> {
    try {
      await this.googlePlay.assertSubscriptionActive({
        packageName: dto.packageName,
        productId: dto.productId,
        purchaseToken: dto.purchaseToken,
      });
    } catch (e) {
      if (e instanceof ServiceUnavailableException) {
        throw e;
      }
      const msg = e instanceof Error ? e.message : 'Play validation failed';
      throw new BadRequestException(msg);
    }

    const other = await this.userRepository.findOne({
      where: { googlePlayPurchaseToken: dto.purchaseToken },
    });
    if (other && other.id !== userId) {
      throw new ConflictException(
        'This Play purchase is already linked to another account.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.isPremium = true;
    user.premiumSince = user.premiumSince ?? new Date();
    user.googlePlayPurchaseToken = dto.purchaseToken;
    user.googlePlayProductId = dto.productId;

    const saved = await this.userRepository.save(user);
    this.getMyAccessUseCase.invalidateForUser(userId);
    return UserAccessResponseDto.fromEntity(saved);
  }
}
