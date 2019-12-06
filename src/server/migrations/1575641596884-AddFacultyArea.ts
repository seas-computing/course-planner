/**
 * The Faculty and Area table were not originally linked previous to this
 * migration.
 *
 * We have updated the Faculty entity by adding a many to one relationship
 * between faculty and area. (Many faculty belong to one area).
 */
import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddFacultyArea1575641596884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "faculty" ADD "areaId" uuid');
    await queryRunner.query('ALTER TABLE "faculty" ADD CONSTRAINT "FK_1c9791b99ab87f67173c391e364" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "faculty" DROP CONSTRAINT "FK_1c9791b99ab87f67173c391e364"');
    await queryRunner.query('ALTER TABLE "faculty" DROP COLUMN "areaId"');
  }
}
