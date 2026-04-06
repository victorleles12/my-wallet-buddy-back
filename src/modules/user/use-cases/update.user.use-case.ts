import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '@/domain/entities/user.entity';
import { UpdateUserRequestDto } from '../api/dto/update.user.request.dto';
import { UserResponseDto } from '../api/dto/user.response.dto';
import {
  normalizeDocument,
  normalizeEmail,
} from '../utils/normalize-user-fields.util';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(
    id: string,
    requesterUserId: string,
    requesterRole: UserRole,
    dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    if (requesterRole !== 'admin' && id !== requesterUserId) {
      throw new ForbiddenException(
        'You can only update your own user profile.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const normalizedEmail =
      dto.email !== undefined ? normalizeEmail(dto.email) : undefined;
    const normalizedDocument =
      dto.document !== undefined ? normalizeDocument(dto.document) : undefined;

    if (normalizedEmail !== undefined && normalizedEmail !== user.email) {
      const taken = await this.userRepository
        .createQueryBuilder('u')
        .where('LOWER(TRIM(u.email)) = :email', { email: normalizedEmail })
        .andWhere('u.id <> :id', { id: user.id })
        .getOne();
      if (taken) {
        throw new ConflictException('Email is already registered.');
      }
    }

    if (
      normalizedDocument !== undefined &&
      normalizedDocument !== user.document
    ) {
      const taken = await this.userRepository
        .createQueryBuilder('u')
        .where('TRIM(u.document) = :document', { document: normalizedDocument })
        .andWhere('u.id <> :id', { id: user.id })
        .getOne();
      if (taken) {
        throw new ConflictException('Document is already registered.');
      }
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (normalizedDocument !== undefined) user.document = normalizedDocument;
    if (dto.address !== undefined) user.address = dto.address;
    if (dto.sex !== undefined) user.sex = dto.sex;
    if (normalizedEmail !== undefined) user.email = normalizedEmail;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
      user.tokenVersion += 1;
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
