import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { MonthlyBillEntity } from './monthly-bill.entity';

@Entity('monthly_bill_month_states')
@Unique('UQ_monthly_bill_month', ['monthlyBillId', 'month'])
export class MonthlyBillMonthStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'monthly_bill_id', type: 'uuid' })
  monthlyBillId: string;

  @ManyToOne(() => MonthlyBillEntity, (b) => b.monthStates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'monthly_bill_id' })
  bill: MonthlyBillEntity;

  /** Formato YYYY-MM (calendário civil). */
  @Column({ type: 'varchar', length: 7 })
  month: string;

  @Column({ type: 'boolean', default: false })
  paid: boolean;

  @Column({ name: 'skipped_for_month', type: 'boolean', default: false })
  skippedForMonth: boolean;
}
