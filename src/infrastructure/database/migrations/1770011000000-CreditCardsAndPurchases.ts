import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreditCardsAndPurchases1770011000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "credit_cards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "name" varchar(120) NOT NULL,
        "color" varchar(7),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_credit_cards" PRIMARY KEY ("id"),
        CONSTRAINT "FK_credit_cards_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_credit_cards_user_id" ON "credit_cards" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "credit_card_purchases" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "credit_card_id" uuid NOT NULL,
        "title" varchar(200) NOT NULL,
        "total_amount" decimal(12,2) NOT NULL,
        "installments_total" integer NOT NULL,
        "paid_installments" integer NOT NULL DEFAULT 0,
        "first_due_date" date NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_credit_card_purchases" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cc_purchases_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cc_purchases_card" FOREIGN KEY ("credit_card_id") REFERENCES "credit_cards"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_cc_purchases_installments" CHECK ("installments_total" >= 1 AND "paid_installments" >= 0 AND "paid_installments" <= "installments_total"),
        CONSTRAINT "CHK_cc_purchases_amount" CHECK ("total_amount" > 0)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cc_purchases_user" ON "credit_card_purchases" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cc_purchases_card" ON "credit_card_purchases" ("credit_card_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cc_purchases_first_due" ON "credit_card_purchases" ("first_due_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "credit_card_purchases"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "credit_cards"`);
  }
}
