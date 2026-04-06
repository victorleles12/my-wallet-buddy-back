import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@/domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  document: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  sex: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      document: entity.document,
      address: entity.address,
      sex: entity.sex,
      email: entity.email,
      phone: entity.phone,
      enabled: entity.enabled,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
