import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { GoalEntity } from './goal.entity';
import { UserEntity } from './user.entity';

@Entity('goal_participants')
@Unique('UQ_goal_participants_goal_user', ['goalId', 'userId'])
export class GoalParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'goal_id', type: 'uuid' })
  goalId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** Valor que esta pessoa já juntou para o objetivo compartilhado. */
  @Column({
    name: 'current_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: '0',
  })
  currentAmount: string;

  @ManyToOne(() => GoalEntity, (g) => g.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: GoalEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
