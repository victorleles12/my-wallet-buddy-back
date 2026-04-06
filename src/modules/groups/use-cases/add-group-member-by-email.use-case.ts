import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyGroupMemberEntity } from '@/domain/entities/family-group-member.entity';
import { UserEntity } from '@/domain/entities/user.entity';
import { AddMemberByEmailRequestDto } from '../api/dto/add-member-by-email.request.dto';
import { GroupDetailResponseDto } from '../api/dto/group-detail.response.dto';
import { FamilyGroupEntity } from '@/domain/entities/family-group.entity';

@Injectable()
export class AddGroupMemberByEmailUseCase {
  constructor(
    @InjectRepository(FamilyGroupEntity)
    private readonly groupRepository: Repository<FamilyGroupEntity>,
    @InjectRepository(FamilyGroupMemberEntity)
    private readonly memberRepository: Repository<FamilyGroupMemberEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async execute(
    groupId: string,
    requesterUserId: string,
    body: AddMemberByEmailRequestDto,
  ): Promise<GroupDetailResponseDto> {
    const requesterMembership = await this.memberRepository.findOne({
      where: { familyGroupId: groupId, userId: requesterUserId },
    });
    if (!requesterMembership) {
      throw new ForbiddenException('You are not a member of this group.');
    }

    const email = body.email.trim();
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('LOWER(TRIM(u.email)) = LOWER(TRIM(:email))', { email })
      .getOne();
    if (!user) {
      throw new NotFoundException('No user registered with this email.');
    }

    if (user.id === requesterUserId) {
      throw new BadRequestException('You are already in this group.');
    }

    const existing = await this.memberRepository.findOne({
      where: { familyGroupId: groupId, userId: user.id },
    });
    if (existing) {
      throw new ConflictException('This user is already in the group.');
    }

    await this.memberRepository.save(
      this.memberRepository.create({
        familyGroupId: groupId,
        userId: user.id,
        role: 'member',
      }),
    );

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: { members: { user: true } },
    });
    return GroupDetailResponseDto.fromEntity(group!);
  }
}
