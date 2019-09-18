import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSEASField1568820199646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" ADD "isSEAS" boolean NOT NULL DEFAULT true');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "isSEAS"');
  }
}
