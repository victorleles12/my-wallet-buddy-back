import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecurringCreditCardPurchases1770012000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      DROP CONSTRAINT IF EXISTS "CHK_cc_purchases_installments"
    `);

    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      ADD COLUMN IF NOT EXISTS "is_recurring" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      ALTER COLUMN "installments_total" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      ALTER COLUMN "paid_installments" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      ADD CONSTRAINT "CHK_cc_purchases_installments_or_recurring"
      CHECK (
        (
          "is_recurring" = true
          AND "installments_total" IS NULL
          AND "paid_installments" IS NULL
        )
        OR
        (
          "is_recurring" = false
          AND "installments_total" IS NOT NULL
          AND "installments_total" >= 1
          AND "paid_installments" IS NOT NULL
          AND "paid_installments" >= 0
          AND "paid_installments" <= "installments_total"
        )
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      DROP CONSTRAINT IF EXISTS "CHK_cc_purchases_installments_or_recurring"
    `);

    await queryRunner.query(`
      UPDATE "credit_card_purchases"
      SET "is_recurring" = false,
          "installments_total" = 1,
          "paid_installments" = 0
      WHERE "is_recurring" = true
    `);

    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      ALTER COLUMN "installments_total" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      ALTER COLUMN "paid_installments" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      DROP COLUMN IF EXISTS "is_recurring"
    `);

    await queryRunner.query(`
      ALTER TABLE "credit_card_purchases"
      ADD CONSTRAINT "CHK_cc_purchases_installments"
      CHECK (
        "installments_total" >= 1
        AND "paid_installments" >= 0
        AND "paid_installments" <= "installments_total"
      )
    `);
  }
}
