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
export class GetUserByIdUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(
    id: string,
    requesterUserId: string,
    requesterRole: UserRole = 'user',
  ): Promise<UserResponseDto> {
    if (requesterRole !== 'admin' && id !== requesterUserId) {
      throw new ForbiddenException(
        'You can only access your own user profile.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return UserResponseDto.fromEntity(user);
  }
}
