import { MigrationInterface, QueryRunner } from 'typeorm';

export class BuildingTable1561486867350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "building" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_bbfaf6c11f141a22d2ab105ee5f" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "room" ADD "buildingId" uuid');
    await queryRunner.query('ALTER TABLE "room" ADD CONSTRAINT "FK_88515f15db1bc3b506028f44893" FOREIGN KEY ("buildingId") REFERENCES "building"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "room" DROP CONSTRAINT "FK_88515f15db1bc3b506028f44893"');
    await queryRunner.query('ALTER TABLE "room" DROP COLUMN "buildingId"');
    await queryRunner.query('DROP TABLE "building"');
  }
}
