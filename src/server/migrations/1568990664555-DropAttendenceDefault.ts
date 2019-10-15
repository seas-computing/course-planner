import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Remove column default `null` values
 *
 * The columns added by [[CourseAttendenceFields1568657763235]] were set to
 * default to `null`. However, columns default to `null` anyway unless they
 * are explicitly set to `NOT NULL` and therefore Postgres tends to strip this
 * off.
 *
 * This would then cause TypeORM to try to re-add `SET DEFAULT null` to all 3
 * columns in every generated migration (similar to the behaviour described in
 * [[ViewColumnsDefault1568819589862]]) leading to unnecessary noise in
 * generated database migrations
 */
export class DropAttendenceDefault1568990664555 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" ALTER COLUMN "preEnrollment" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "course_instance" ALTER COLUMN "studyCardEnrollment" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "course_instance" ALTER COLUMN "actualEnrollment" DROP DEFAULT');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" ALTER COLUMN "preEnrollment" SET DEFAULT null');
    await queryRunner.query('ALTER TABLE "course_instance" ALTER COLUMN "studyCardEnrollment" SET DEFAULT null');
    await queryRunner.query('ALTER TABLE "course_instance" ALTER COLUMN "actualEnrollment" SET DEFAULT null');
  }
}
