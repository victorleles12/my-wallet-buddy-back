import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FamilyGroupEntity } from './family-group.entity';
import { UserEntity } from './user.entity';

export type TransactionKind = 'income' | 'expense';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 20 })
  type: TransactionKind;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ name: 'occurred_on', type: 'date' })
  occurredOn: string;

  @Column({ name: 'is_family', type: 'boolean', default: false })
  isFamily: boolean;

  @Column({ name: 'family_group_id', type: 'uuid', nullable: true })
  familyGroupId: string | null;

  @ManyToOne(() => FamilyGroupEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'family_group_id' })
  familyGroup: FamilyGroupEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
