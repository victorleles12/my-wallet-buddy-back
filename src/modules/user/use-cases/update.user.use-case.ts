import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { UpdateUserRequestDto } from '../api/dto/update.user.request.dto';
import { UserResponseDto } from '../api/dto/user.response.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(id: string, dto: UpdateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (dto.email !== undefined && dto.email !== user.email) {
      const taken = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (taken) {
        throw new ConflictException('Email is already registered.');
      }
    }

    if (dto.document !== undefined && dto.document !== user.document) {
      const taken = await this.userRepository.findOne({
        where: { document: dto.document },
      });
      if (taken) {
        throw new ConflictException('Document is already registered.');
      }
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.document !== undefined) user.document = dto.document;
    if (dto.address !== undefined) user.address = dto.address;
    if (dto.sex !== undefined) user.sex = dto.sex;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.enabled !== undefined) user.enabled = dto.enabled;

    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    try {
      const saved = await this.userRepository.save(user);
      return UserResponseDto.fromEntity(saved);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Email or document is already registered.');
      }
      throw new InternalServerErrorException('Could not update user.');
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    );
  }
}
