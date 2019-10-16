import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameOfViewColumn1571237522606 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "view" ADD "name" character varying NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "view" DROP COLUMN "name"');
  }
}
