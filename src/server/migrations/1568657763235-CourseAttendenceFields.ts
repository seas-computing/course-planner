import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Course Attendence Statistics
 *
 * Add course attendence fields to allow administrators to record attendenace
 * and enrollment information.
 *
 * - `preEnrollment` is projected before shopping week
 * - `studyCardEnrollment` is calculated during shopping week
 * - `actualEnrollment` is calculated one week after shopping week
 *
 * This information is then used by administrators going forwrard for
 * statistical analysis and reporting purposes
 */
export class CourseAttendenceFields1568657763235 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" ADD "preEnrollment" integer DEFAULT null');
    await queryRunner.query('ALTER TABLE "course_instance" ADD "studyCardEnrollment" integer DEFAULT null');
    await queryRunner.query('ALTER TABLE "course_instance" ADD "actualEnrollment" integer DEFAULT null');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "actualEnrollment"');
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "studyCardEnrollment"');
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "preEnrollment"');
  }
}
