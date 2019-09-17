import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCourseInstanceName1568725862144 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" DROP COLUMN "name"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" ADD "name" character varying NOT NULL');
  }
}
