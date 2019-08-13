import { MigrationInterface, QueryRunner } from 'typeorm';

export class AbsenceTable1561553827060 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "absence_type_enum" AS ENUM(\'SABBATICAL\', \'SABBATICAL_ELIGIBLE\', \'SABBATICAL_INELIGIBLE\', \'TEACHING_RELIEF\', \'RESEARCH_LEAVE\', \'PARENTAL_LEAVE\', \'NO_LONGER_ACTIVE\')');
    await queryRunner.query('CREATE TABLE "absence" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" "absence_type_enum" NOT NULL, "facultyId" uuid, CONSTRAINT "PK_30089b15c0f880f026581218c16" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "semester" ADD "absencesId" uuid');
    await queryRunner.query('ALTER TABLE "semester" ADD CONSTRAINT "FK_0a723c10084a8713615a5456dc7" FOREIGN KEY ("absencesId") REFERENCES "absence"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "absence" ADD CONSTRAINT "FK_fd114f66860d8273bf44fbac7a5" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "absence" DROP CONSTRAINT "FK_fd114f66860d8273bf44fbac7a5"');
    await queryRunner.query('ALTER TABLE "semester" DROP CONSTRAINT "FK_0a723c10084a8713615a5456dc7"');
    await queryRunner.query('ALTER TABLE "semester" DROP COLUMN "absencesId"');
    await queryRunner.query('DROP TABLE "absence"');
    await queryRunner.query('DROP TYPE "absence_type_enum"');
  }
}
