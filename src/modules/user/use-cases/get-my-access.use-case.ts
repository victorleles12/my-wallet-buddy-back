import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserAccessResponseDto } from '../api/dto/user-access.response.dto';

@Injectable()
export class GetMyAccessUseCase {
  private readonly accessCache = new Map<
    string,
    { value: UserAccessResponseDto; expiresAt: number }
  >();
  private readonly cacheTtlMs = 30_000;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(userId: string): Promise<UserAccessResponseDto> {
    const cached = this.accessCache.get(userId);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const value = UserAccessResponseDto.fromEntity(user);
    this.accessCache.set(userId, { value, expiresAt: now + this.cacheTtlMs });
    return value;
  }
}
