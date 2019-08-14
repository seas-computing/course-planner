import { MigrationInterface, QueryRunner } from 'typeorm';

export class CampusTable1561487455459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "campus" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_150aa1747b3517c47f9bd98ea6d" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "building" ADD "campusId" uuid');
    await queryRunner.query('ALTER TABLE "building" ADD CONSTRAINT "FK_4e7acc1b5b05354d7b21b1e7a6c" FOREIGN KEY ("campusId") REFERENCES "campus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "building" DROP CONSTRAINT "FK_4e7acc1b5b05354d7b21b1e7a6c"');
    await queryRunner.query('ALTER TABLE "building" DROP COLUMN "campusId"');
    await queryRunner.query('DROP TABLE "campus"');
  }
}
