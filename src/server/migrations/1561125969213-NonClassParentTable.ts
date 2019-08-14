import { MigrationInterface, QueryRunner } from 'typeorm';

export class NonClassParentTable1561125969213 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "non_class_parent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "contact" character varying NOT NULL, "courseId" uuid, CONSTRAINT "PK_d7973507d066496291d144d95e6" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD CONSTRAINT "FK_6b821019772b6920f70f81dcdca" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP CONSTRAINT "FK_6b821019772b6920f70f81dcdca"');
    await queryRunner.query('DROP TABLE "non_class_parent"');
  }
}
