import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rename `undergraduate` column to `isUndergraduate`. The naming of this column
 * implemented in [[CourseTable1560956281223]] was originally intended to be
 * consistent with the old mongo database, however it makes more sense for it
 * to be consistent with the other `isSEAS` column in this table.
 */
export class RenameUnderGradColumn1575307866260 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" RENAME COLUMN "undergraduate" TO "isUndergraduate"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" RENAME COLUMN "isUndergraduate" TO "undergraduate"');
  }
}
