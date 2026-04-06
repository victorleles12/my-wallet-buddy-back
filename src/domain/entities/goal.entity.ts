import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GoalItemEntity } from './goal-item.entity';
import { GoalParticipantEntity } from './goal-participant.entity';

@Entity('goals')
export class GoalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'target_amount', type: 'decimal', precision: 12, scale: 2 })
  targetAmount: string;

  @Column({ type: 'date' })
  deadline: string;

  @Column({ type: 'varchar', length: 50 })
  icon: string;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId: string;

  @OneToMany(() => GoalParticipantEntity, (p) => p.goal, {
    cascade: ['insert', 'update'],
  })
  participants: GoalParticipantEntity[];

  @OneToMany(() => GoalItemEntity, (i) => i.goal)
  items: GoalItemEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
