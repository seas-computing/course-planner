import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration revises the MultiYearPlanInstanceView to match the new
 * data structure of the MultiYearPlanResponseDTO in which semesters point to
 * one course instance. It also adds a SemesterView, which calculates the
 * academic year and also includes other properties from the Semester entity.
 */
export class MultiYearPlanSemesters1591308687655 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MultiYearPlanInstanceView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanInstanceView"', undefined);
    await queryRunner.query('CREATE VIEW "MultiYearPlanInstanceView" AS SELECT "ci"."id" AS "id", ci."courseId" AS "courseId", ci."semesterId" AS "semesterId" FROM "course_instance" "ci"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanInstanceView', 'SELECT "ci"."id" AS "id", ci."courseId" AS "courseId", ci."semesterId" AS "semesterId" FROM "course_instance" "ci"']);
    await queryRunner.query(`CREATE VIEW "SemesterView" AS SELECT "s"."id" AS "id", "s"."term" AS "term", s."academicYear" AS "calendarYear", CASE
      WHEN term = 'FALL' THEN "s"."academicYear" + 1
      ELSE "s"."academicYear"
    END AS "academicYear", CASE
    WHEN term = 'SPRING' THEN 1
    WHEN term = 'FALL' THEN 2
    ELSE 3
    END AS "termOrder" FROM "semester" "s"`, undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'SemesterView', "SELECT \"s\".\"id\" AS \"id\", \"s\".\"term\" AS \"term\", s.\"academicYear\" AS \"calendarYear\", CASE\n      WHEN term = 'FALL' THEN \"s\".\"academicYear\" + 1\n      ELSE \"s\".\"academicYear\"\n    END AS \"academicYear\", CASE\n    WHEN term = 'SPRING' THEN 1\n    WHEN term = 'FALL' THEN 2\n    ELSE 3\n    END AS \"termOrder\" FROM \"semester\" \"s\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'SemesterView']);
    await queryRunner.query('DROP VIEW "SemesterView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MultiYearPlanInstanceView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanInstanceView"', undefined);
    await queryRunner.query(`CREATE VIEW "MultiYearPlanInstanceView" AS SELECT "ci"."id" AS "id", "s"."academicYear" AS "calendarYear", "s"."term" AS "term", ci."courseId" AS "courseId", CASE
        WHEN term = 'FALL' THEN "s"."academicYear" + 1
        ELSE "s"."academicYear"
      END AS "academicYear", ci."semesterId" AS "semesterId" FROM "course_instance" "ci" LEFT JOIN "semester" "s" ON "s"."id" = ci."semesterId"`, undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanInstanceView', "SELECT \"ci\".\"id\" AS \"id\", \"s\".\"academicYear\" AS \"calendarYear\", \"s\".\"term\" AS \"term\", ci.\"courseId\" AS \"courseId\", CASE\n        WHEN term = 'FALL' THEN \"s\".\"academicYear\" + 1\n        ELSE \"s\".\"academicYear\"\n      END AS \"academicYear\", ci.\"semesterId\" AS \"semesterId\" FROM \"course_instance\" \"ci\" LEFT JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\""]);
  }
}
