import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '@/domain/entities/user.entity';
import { UserResponseDto } from '../api/dto/user.response.dto';

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(
    id: string,
    requesterRole: UserRole,
    enabled: boolean,
  ): Promise<UserResponseDto> {
    if (requesterRole !== 'admin') {
      throw new ForbiddenException(
        'Only admins can change user enabled status.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.enabled = enabled;
    user.tokenVersion += 1;
    const saved = await this.userRepository.save(user);
    return UserResponseDto.fromEntity(saved);
  }
}
