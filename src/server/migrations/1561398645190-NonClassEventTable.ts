import { MigrationInterface, QueryRunner } from 'typeorm';

export class NonClassEventTable1561398645190 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "non_class_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "private" boolean NOT NULL DEFAULT true, "nonClassParentId" uuid, "semesterId" uuid, CONSTRAINT "PK_2395e962f397fd70983c3722034" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "non_class_event" ADD CONSTRAINT "FK_0de8119a420ec18d32f836059e6" FOREIGN KEY ("nonClassParentId") REFERENCES "non_class_parent"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "non_class_event" ADD CONSTRAINT "FK_81cdd11bcdd8f64e284abe1e3c6" FOREIGN KEY ("semesterId") REFERENCES "semester"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "non_class_event" DROP CONSTRAINT "FK_81cdd11bcdd8f64e284abe1e3c6"');
    await queryRunner.query('ALTER TABLE "non_class_event" DROP CONSTRAINT "FK_0de8119a420ec18d32f836059e6"');
    await queryRunner.query('DROP TABLE "non_class_event"');
  }
}
