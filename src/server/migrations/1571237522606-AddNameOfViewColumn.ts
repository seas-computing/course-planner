import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration adds a name column to the view so that the user can identify
 * which view they're seeing.
 * The original table was created by [[ViewTable1562766869548]]
 */
export class AddNameOfViewColumn1571237522606 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "view" ADD "name" character varying NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "view" DROP COLUMN "name"');
  }
}
