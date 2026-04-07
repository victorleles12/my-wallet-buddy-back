import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserAccessResponseDto } from '../api/dto/user-access.response.dto';

@Injectable()
export class ActivatePremiumUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(userId: string): Promise<UserAccessResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!user.isPremium) {
      user.isPremium = true;
      user.premiumSince = user.premiumSince ?? new Date();
    }

    const saved = await this.userRepository.save(user);
    return UserAccessResponseDto.fromEntity(saved);
  }
}
