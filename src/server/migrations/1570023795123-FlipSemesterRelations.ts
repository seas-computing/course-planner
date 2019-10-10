import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Reverse semester migrations as they had been mistakenly implemented backward
 * in [[CourseAttendenceFields1568657763235]] meaning that one absence had many
 * semesters, rather than one semester having many absences
 */
export class FlipSemesterRelations1570023795123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "semester" DROP CONSTRAINT "FK_bc7d0876e268a27203f3279effc"');
    await queryRunner.query('ALTER TABLE "semester" DROP CONSTRAINT "FK_0a723c10084a8713615a5456dc7"');
    await queryRunner.query('ALTER TABLE "semester" DROP COLUMN "courseInstancesId"');
    await queryRunner.query('ALTER TABLE "semester" DROP COLUMN "absencesId"');
    await queryRunner.query('ALTER TABLE "course_instance" ADD "semesterId" uuid');
    await queryRunner.query('ALTER TABLE "absence" ADD "semesterId" uuid');
    await queryRunner.query('ALTER TABLE "course_instance" ADD CONSTRAINT "FK_e7995b6a40654d2049888831a2e" FOREIGN KEY ("semesterId") REFERENCES "semester"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "absence" ADD CONSTRAINT "FK_a8ddf5e334e5031bd151b47ffb4" FOREIGN KEY ("semesterId") REFERENCES "semester"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "absence" DROP CONSTRAINT "FK_a8ddf5e334e5031bd151b47ffb4"');
    await queryRunner.query('ALTER TABLE "course_instance" DROP CONSTRAINT "FK_e7995b6a40654d2049888831a2e"');
    await queryRunner.query('ALTER TABLE "absence" DROP COLUMN "semesterId"');
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "semesterId"');
    await queryRunner.query('ALTER TABLE "semester" ADD "absencesId" uuid');
    await queryRunner.query('ALTER TABLE "semester" ADD "courseInstancesId" uuid');
    await queryRunner.query('ALTER TABLE "semester" ADD CONSTRAINT "FK_0a723c10084a8713615a5456dc7" FOREIGN KEY ("absencesId") REFERENCES "absence"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "semester" ADD CONSTRAINT "FK_bc7d0876e268a27203f3279effc" FOREIGN KEY ("courseInstancesId") REFERENCES "course_instance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }
}
