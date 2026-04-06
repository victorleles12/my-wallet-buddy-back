import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserNormalizedUniqueIndexes1770008000000 implements MigrationInterface {
  name = 'UserNormalizedUniqueIndexes1770008000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email_normalized"
      ON "users" ((LOWER(TRIM(email))))
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_document_normalized"
      ON "users" ((TRIM(document)))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_users_document_normalized"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_users_email_normalized"`);
  }
}
