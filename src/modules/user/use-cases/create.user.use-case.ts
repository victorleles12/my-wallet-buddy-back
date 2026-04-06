import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '@/domain/entities/user.entity';
import { CreateUserRequestDto } from '../api/dto/create.user.request.dto';
import { UserResponseDto } from '../api/dto/user.response.dto';
import {
  normalizeDocument,
  normalizeEmail,
} from '../utils/normalize-user-fields.util';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const email = normalizeEmail(dto.email);
    const document = normalizeDocument(dto.document);

    const existing = await this.userRepository
      .createQueryBuilder('u')
      .where('LOWER(TRIM(u.email)) = :email', { email })
      .orWhere('TRIM(u.document) = :document', { document })
      .getOne();
    if (existing) {
      throw new ConflictException('Email or document is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      document,
      address: dto.address,
      sex: dto.sex,
      email,
      phone: dto.phone,
      passwordHash,
      enabled: dto.enabled ?? true,
    });

    try {
      const saved = await this.userRepository.save(user);
      return UserResponseDto.fromEntity(saved);
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Email or document is already registered.');
      }
      throw new InternalServerErrorException('Could not create user.');
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
