import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration adds new fields to the Course entity representing only the
 * numerical and alphabetical portions of the course number, for use in
 * sorting. The existing "number" field will remain for display purposes.
 */
export class SplitCourseNumber1623944858236 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" ADD "numberInteger" integer');
    await queryRunner.query('COMMENT ON COLUMN "course"."numberInteger" IS \'Only the numerical portion of a course number (e.g. - 109 in "CS 109b")\'');
    await queryRunner.query('ALTER TABLE "course" ADD "numberAlphabetical" text');
    await queryRunner.query('COMMENT ON COLUMN "course"."numberAlphabetical" IS \'Only the alphabetical portion, if any, of a course number (e.g. the "a" of "CS 109a")\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('COMMENT ON COLUMN "course"."numberAlphabetical" IS \'Only the alphabetical portion, if any, of a course number (e.g. the "a" of "CS 109a")\'');
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "numberAlphabetical"');
    await queryRunner.query('COMMENT ON COLUMN "course"."numberInteger" IS \'Only the numerical portion of a course number (e.g. - 109 in "CS 109b")\'');
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "numberInteger"');
  }
}
