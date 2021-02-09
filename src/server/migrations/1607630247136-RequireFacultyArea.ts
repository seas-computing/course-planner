import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 *  Updates the Faculty model to require each faculty member to belong to an
 *  area.
 */

export class RequireFacultyArea1607630247136 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "faculty" DROP CONSTRAINT "FK_1c9791b99ab87f67173c391e364"');
    await queryRunner.query('ALTER TABLE "faculty" ALTER COLUMN "areaId" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "faculty" ADD CONSTRAINT "FK_1c9791b99ab87f67173c391e364" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "faculty" DROP CONSTRAINT "FK_1c9791b99ab87f67173c391e364"');
    await queryRunner.query('ALTER TABLE "faculty" ALTER COLUMN "areaId" DROP NOT NULL');
    await queryRunner.query('ALTER TABLE "faculty" ADD CONSTRAINT "FK_1c9791b99ab87f67173c391e364" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }
}
