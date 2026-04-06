import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GoalEntity } from './goal.entity';

/** Linha de custo planejado para o objetivo (ex.: passagens, hotel). */
@Entity('goal_items')
export class GoalItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'goal_id', type: 'uuid' })
  goalId: string;

  @Column({ type: 'varchar', length: 200 })
  label: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => GoalEntity, (g) => g.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: GoalEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
