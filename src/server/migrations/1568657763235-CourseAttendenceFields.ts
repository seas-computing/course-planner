import { MigrationInterface, QueryRunner } from 'typeorm';

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
