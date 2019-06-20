import { MigrationInterface, QueryRunner } from 'typeorm';

export class FacultyTable1561005425013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "faculty_category_enum" AS ENUM(\'ladder\', \'non_ladder\')');
    await queryRunner.query('CREATE TABLE "faculty" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "firstname" character varying, "lastname" character varying, "email" character varying, "category" "faculty_category_enum" NOT NULL DEFAULT \'non_ladder\', CONSTRAINT "PK_635ca3484f9c747b6635a494ad9" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE TABLE "faculty_course_instances_course_instance" ("facultyId" uuid NOT NULL, "courseInstanceId" uuid NOT NULL, CONSTRAINT "PK_43da76a139c24e501bcb78c45e2" PRIMARY KEY ("facultyId", "courseInstanceId"))');
    await queryRunner.query('CREATE INDEX "IDX_65d45c5857d419295ee55c16de" ON "faculty_course_instances_course_instance" ("facultyId") ');
    await queryRunner.query('CREATE INDEX "IDX_7d5d1b3b6714381a6e7ded5f63" ON "faculty_course_instances_course_instance" ("courseInstanceId") ');
    await queryRunner.query('ALTER TABLE "faculty_course_instances_course_instance" ADD CONSTRAINT "FK_65d45c5857d419295ee55c16de5" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "faculty_course_instances_course_instance" ADD CONSTRAINT "FK_7d5d1b3b6714381a6e7ded5f63c" FOREIGN KEY ("courseInstanceId") REFERENCES "course_instance"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "faculty_course_instances_course_instance" DROP CONSTRAINT "FK_7d5d1b3b6714381a6e7ded5f63c"');
    await queryRunner.query('ALTER TABLE "faculty_course_instances_course_instance" DROP CONSTRAINT "FK_65d45c5857d419295ee55c16de5"');
    await queryRunner.query('DROP INDEX "IDX_7d5d1b3b6714381a6e7ded5f63"');
    await queryRunner.query('DROP INDEX "IDX_65d45c5857d419295ee55c16de"');
    await queryRunner.query('DROP TABLE "faculty_course_instances_course_instance"');
    await queryRunner.query('DROP TABLE "faculty"');
    await queryRunner.query('DROP TYPE "faculty_category_enum"');
  }
}
