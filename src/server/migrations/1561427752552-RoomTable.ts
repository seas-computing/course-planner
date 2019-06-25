import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomTable1561427752552 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "floor" character varying NOT NULL, "capacity" integer NOT NULL, "meetingsId" uuid, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "room" ADD CONSTRAINT "FK_b06efa750185fad4fa01ee732c8" FOREIGN KEY ("meetingsId") REFERENCES "meeting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "room" DROP CONSTRAINT "FK_b06efa750185fad4fa01ee732c8"');
    await queryRunner.query('DROP TABLE "room"');
  }
}
