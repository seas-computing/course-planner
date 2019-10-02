import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Remove empty array column default from `view` table
 *
 * The migration used to generate the `View` table ([[ViewTable1562766869548]])
 * added a default value of `[]` to the `columns` field.
 * This default value was stripped off by Postgres because array columns have a
 * default value of `[]` anyway.
 *
 * When a new migration was generated, TypeORM saw the missing default value and
 * tried to add it to every single migration that was being generated. This led
 * to
 *
 * ```sql
 *  ALTER TABLE "view" ALTER COLUMN "columns" SET DEFAULT \'{}\'
 * ```
 *
 * being added to every migration
 *
 */
export class ViewColumnsDefault1568819589862 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "view" ALTER COLUMN "columns" DROP DEFAULT');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "view" ALTER COLUMN "columns" SET DEFAULT \'{}\'');
  }
}
