import { MigrationInterface, QueryRunner } from 'typeorm';

export class NullableTermPattern1569266216193 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" ALTER COLUMN "termPattern" DROP NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" ALTER COLUMN "termPattern" SET NOT NULL');
  }
}
