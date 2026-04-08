import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreditCardEntity } from './credit-card.entity';
import { UserEntity } from './user.entity';

@Entity('credit_card_purchases')
export class CreditCardPurchaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'credit_card_id', type: 'uuid' })
  creditCardId: string;

  @ManyToOne(() => CreditCardEntity, (c) => c.purchases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'credit_card_id' })
  creditCard: CreditCardEntity;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: string;

  /** Assinatura/recorrente (valor cobrado todo mês, sem última parcela). */
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ name: 'installments_total', type: 'int', nullable: true })
  installmentsTotal: number | null;

  @Column({ name: 'paid_installments', type: 'int', nullable: true })
  paidInstallments: number | null;

  @Column({ name: 'first_due_date', type: 'date' })
  firstDueDate: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
