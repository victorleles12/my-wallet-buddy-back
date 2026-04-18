import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'admin' | 'user';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  document: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'varchar', length: 20 })
  sex: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: UserRole;

  @Column({ name: 'token_version', type: 'int', default: 0 })
  tokenVersion: number;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ name: 'premium_since', type: 'timestamptz', nullable: true })
  premiumSince: Date | null;

  @Column({ name: 'ad_unlock_until', type: 'timestamptz', nullable: true })
  adUnlockUntil: Date | null;

  /** Último token de compra Play validado (subscrição); único na tabela. */
  @Column({
    name: 'google_play_purchase_token',
    type: 'varchar',
    length: 500,
    nullable: true,
    unique: true,
  })
  googlePlayPurchaseToken: string | null;

  @Column({
    name: 'google_play_product_id',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  googlePlayProductId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
