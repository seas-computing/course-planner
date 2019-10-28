import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The original table for storing [[Faculty]] ([[FacultyTable1561005425013]])
 * was missing a `jointWith` field. This field is used to record the primary
 * affiliations of faculty who are not entirely associated with SEAS (for
 * example, they may also have a teaching post within Harvard Kennedy School
 * or the Business School).
 */
export class AddJointWithField1572023205028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "faculty" ADD "jointWith" character varying');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "faculty" DROP COLUMN "jointWith"');
  }
}
