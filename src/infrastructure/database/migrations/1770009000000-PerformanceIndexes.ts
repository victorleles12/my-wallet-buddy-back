import { MigrationInterface, QueryRunner } from 'typeorm';

export class PerformanceIndexes1770009000000 implements MigrationInterface {
  name = 'PerformanceIndexes1770009000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_transactions_user_is_family_occurred_created"
      ON "transactions" ("user_id", "is_family", "occurred_on" DESC, "created_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_transactions_group_is_family_occurred_created"
      ON "transactions" ("family_group_id", "is_family", "occurred_on" DESC, "created_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_family_group_members_user_group"
      ON "family_group_members" ("user_id", "family_group_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_goal_participants_user_goal"
      ON "goal_participants" ("user_id", "goal_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_goal_participants_user_goal"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_family_group_members_user_group"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_transactions_group_is_family_occurred_created"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_transactions_user_is_family_occurred_created"`,
    );
  }
}
