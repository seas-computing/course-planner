import { MigrationInterface, QueryRunner } from 'typeorm';

export class FacultyTable1561005425013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "faculty_category_enum" AS ENUM(\'LADDER\', \'NON_LADDER\')');
    await queryRunner.query('CREATE TABLE "faculty" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "firstName" character varying NOT NULL DEFAULT \'\', "lastName" character varying NOT NULL DEFAULT \'\', "HUID" character varying NOT NULL, "category" "faculty_category_enum" NOT NULL DEFAULT \'NON_LADDER\', CONSTRAINT "PK_635ca3484f9c747b6635a494ad9" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_37a534d3bdf13e458a16d00e31" ON "faculty" ("HUID") ');
    await queryRunner.query('CREATE TABLE "faculty_course_instances_course_instance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "order" integer NOT NULL, "courseInstanceId" uuid, "facultyId" uuid, CONSTRAINT "PK_b532c5a1d158dd0e414356ad9cd" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_65d45c5857d419295ee55c16de" ON "faculty_course_instances_course_instance" ("facultyId") ');
    await queryRunner.query('CREATE INDEX "IDX_7d5d1b3b6714381a6e7ded5f63" ON "faculty_course_instances_course_instance" ("courseInstanceId") ');
    await queryRunner.query('ALTER TABLE "faculty_course_instances_course_instance" ADD CONSTRAINT "FK_65d45c5857d419295ee55c16de5" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "faculty_course_instances_course_instance" ADD CONSTRAINT "FK_7d5d1b3b6714381a6e7ded5f63c" FOREIGN KEY ("courseInstanceId") REFERENCES "course_instance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "faculty_course_instances_course_instance" DROP CONSTRAINT "FK_7d5d1b3b6714381a6e7ded5f63c"');
    await queryRunner.query('ALTER TABLE "faculty_course_instances_course_instance" DROP CONSTRAINT "FK_65d45c5857d419295ee55c16de5"');
    await queryRunner.query('DROP TABLE "faculty_course_instances_course_instance"');
    await queryRunner.query('DROP TABLE "faculty"');
    await queryRunner.query('DROP TYPE "faculty_category_enum"');
  }
}
