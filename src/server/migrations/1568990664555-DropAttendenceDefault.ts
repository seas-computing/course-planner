import { MigrationInterface, QueryRunner } from 'typeorm';

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
