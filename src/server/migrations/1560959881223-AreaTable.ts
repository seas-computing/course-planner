import { MigrationInterface, QueryRunner } from 'typeorm';

export class AreaTable1560959881223 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "area" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_39d5e4de490139d6535d75f42ff" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "course" ADD "areaId" uuid');
    await queryRunner.query('ALTER TABLE "course" ADD CONSTRAINT "FK_d43d51e738645bda6c1afca405b" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" DROP CONSTRAINT "FK_d43d51e738645bda6c1afca405b"');
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "areaId"');
    await queryRunner.query('DROP TABLE "area"');
  }
}
