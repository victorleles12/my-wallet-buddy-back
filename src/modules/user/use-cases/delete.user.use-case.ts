import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '@/domain/entities/user.entity';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(
    id: string,
    requesterUserId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    if (requesterRole !== 'admin' && id !== requesterUserId) {
      throw new ForbiddenException(
        'You can only delete your own user profile.',
      );
    }

    const result = await this.userRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('User not found.');
    }
  }
}
