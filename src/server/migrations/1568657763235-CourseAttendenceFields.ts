import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseAttendenceFields1568657763235 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" ADD "pre" integer DEFAULT null');
    await queryRunner.query('ALTER TABLE "course_instance" ADD "studyCard" integer DEFAULT null');
    await queryRunner.query('ALTER TABLE "course_instance" ADD "actual" integer DEFAULT null');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "actual"');
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "studyCard"');
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "pre"');
  }
}
