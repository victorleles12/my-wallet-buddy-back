import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGooglePlayPurchaseTokenToUsers1772000000000
  implements MigrationInterface
{
  name = 'AddGooglePlayPurchaseTokenToUsers1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_play_purchase_token" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_play_product_id" character varying(200)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_google_play_purchase_token" ON "users" ("google_play_purchase_token") WHERE "google_play_purchase_token" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_users_google_play_purchase_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "google_play_product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "google_play_purchase_token"`,
    );
  }
}
