import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `isSEAS` to the course table
 *
 * This field is used to determined if a course is a SEAS course. Some courses
 * in the course planning application exist simply to help scheduling, but
 * should not be publicly displayed as they are not actually courses offered
 * by SEAS (for example science courses offered by FAS).
 *
 * The original assumption made in [[CourseTable1560956281223]] was that this
 * field could be calculated from other existing fields, but this turned out
 * not to be the case
 */
export class AddIsSEASField1568820199646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" ADD "isSEAS" boolean NOT NULL DEFAULT true');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "isSEAS"');
  }
}
