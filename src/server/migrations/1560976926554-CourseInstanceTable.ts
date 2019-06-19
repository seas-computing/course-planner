import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseInstanceTable1560976926554 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "course_instance_offered_enum" AS ENUM(\'Y\', \'N\', \'\', \'RETIRED\')');
    await queryRunner.query('CREATE TABLE "course_instance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "offered" "course_instance_offered_enum" NOT NULL DEFAULT \'\', "courseId" uuid, CONSTRAINT "PK_777758eae1bf7d9b17e9c37526e" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "course_instance" ADD CONSTRAINT "FK_abd28bc51520e5b379a47832a9d" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course_instance" DROP CONSTRAINT "FK_abd28bc51520e5b379a47832a9d"');
    await queryRunner.query('DROP TABLE "course_instance"');
    await queryRunner.query('DROP TYPE "course_instance_offered_enum"');
  }
}
