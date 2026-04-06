import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(id: string): Promise<void> {
    const result = await this.userRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('User not found.');
    }
  }
}
