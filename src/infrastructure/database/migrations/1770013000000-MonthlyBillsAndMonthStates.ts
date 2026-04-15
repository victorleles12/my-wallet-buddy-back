import { MigrationInterface, QueryRunner } from 'typeorm';

export class MonthlyBillsAndMonthStates1770013000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "monthly_bills" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "due_day" integer NOT NULL,
        "amount" decimal(12,2),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_monthly_bills" PRIMARY KEY ("id"),
        CONSTRAINT "FK_monthly_bills_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_monthly_bills_due_day" CHECK ("due_day" >= 1 AND "due_day" <= 31)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_monthly_bills_user_id" ON "monthly_bills" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "monthly_bill_month_states" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "monthly_bill_id" uuid NOT NULL,
        "month" varchar(7) NOT NULL,
        "paid" boolean NOT NULL DEFAULT false,
        "skipped_for_month" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_monthly_bill_month_states" PRIMARY KEY ("id"),
        CONSTRAINT "FK_mb_month_states_bill" FOREIGN KEY ("monthly_bill_id") REFERENCES "monthly_bills"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_mb_month_states_bill_month" UNIQUE ("monthly_bill_id", "month"),
        CONSTRAINT "CHK_mb_month_states_month" CHECK ("month" ~ '^[0-9]{4}-[0-9]{2}$')
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_mb_month_states_bill_month" ON "monthly_bill_month_states" ("monthly_bill_id", "month")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "monthly_bill_month_states"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "monthly_bills"`);
  }
}
