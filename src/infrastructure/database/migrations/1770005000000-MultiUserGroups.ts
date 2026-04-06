import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiUserGroups1770005000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_family_group_members_user_id"`,
    );

    await queryRunner.query(`
      ALTER TABLE "family_groups"
      ADD COLUMN IF NOT EXISTS "name" varchar(120) NOT NULL DEFAULT 'Grupo'
    `);

    await queryRunner.query(`
      ALTER TABLE "family_groups"
      ADD COLUMN IF NOT EXISTS "created_by_user_id" uuid
    `);

    await queryRunner.query(`
      UPDATE "family_groups" g
      SET "created_by_user_id" = sub.user_id
      FROM (
        SELECT DISTINCT ON (m.family_group_id) m.family_group_id, m.user_id
        FROM "family_group_members" m
        ORDER BY m.family_group_id, m.created_at ASC
      ) sub
      WHERE sub.family_group_id = g.id AND g.created_by_user_id IS NULL
    `);

    await queryRunner.query(`
      DELETE FROM "family_groups" g
      WHERE NOT EXISTS (
        SELECT 1 FROM "family_group_members" m WHERE m.family_group_id = g.id
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "family_groups"
      ALTER COLUMN "created_by_user_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "family_groups"
      ADD CONSTRAINT "FK_family_groups_created_by_user"
      FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "family_group_members"
      ADD COLUMN IF NOT EXISTS "role" varchar(20) NOT NULL DEFAULT 'member'
    `);

    await queryRunner.query(`
      UPDATE "family_group_members" m
      SET role = 'owner'
      FROM "family_groups" g
      WHERE m.family_group_id = g.id AND m.user_id = g.created_by_user_id
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_family_group_members_group_user"
      ON "family_group_members" ("family_group_id", "user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_family_group_members_group_user"`,
    );

    await queryRunner.query(
      `ALTER TABLE "family_group_members" DROP COLUMN IF EXISTS "role"`,
    );

    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP CONSTRAINT IF EXISTS "FK_family_groups_created_by_user"`,
    );

    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP COLUMN IF EXISTS "created_by_user_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "family_groups" DROP COLUMN IF EXISTS "name"`,
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_family_group_members_user_id"
      ON "family_group_members" ("user_id")
    `);
  }
}
