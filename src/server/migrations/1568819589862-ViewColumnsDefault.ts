import { MigrationInterface, QueryRunner } from 'typeorm';

export class ViewColumnsDefault1568819589862 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "view" ALTER COLUMN "columns" DROP DEFAULT');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "view" ALTER COLUMN "columns" SET DEFAULT \'{}\'');
  }
}
