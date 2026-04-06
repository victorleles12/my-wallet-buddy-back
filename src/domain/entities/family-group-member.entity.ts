import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { FamilyGroupEntity } from './family-group.entity';
import { UserEntity } from './user.entity';

export type GroupMemberRole = 'owner' | 'member';

@Entity('family_group_members')
@Unique('UQ_family_group_members_group_user', ['familyGroupId', 'userId'])
export class FamilyGroupMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'family_group_id', type: 'uuid' })
  familyGroupId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  role: GroupMemberRole;

  @ManyToOne(() => FamilyGroupEntity, (g) => g.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_group_id' })
  group: FamilyGroupEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
