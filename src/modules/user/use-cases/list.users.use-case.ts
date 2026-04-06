import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { UserResponseDto } from '../api/dto/user.response.dto';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(limit = 50, offset = 0): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return users.map((u) => UserResponseDto.fromEntity(u));
  }
}
