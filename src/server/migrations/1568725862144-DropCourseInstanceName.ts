import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Remove name field from `course_instance`
 *
 * The `name` field was originally added as a way to track changes to course
 * names over time and to provide a way to determine all previous names a course
 * has ever had.
 *
 * It was then decided that this field was no longer necessary and could be
 * removed
 */
export class DropCourseInstanceName1568725862144 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "name"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" ADD "name" character varying NOT NULL');
  }
}
