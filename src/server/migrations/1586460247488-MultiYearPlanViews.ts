import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiYearPlanViews1586460247488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE VIEW "MultiYearPlanInstanceView" AS SELECT "ci"."id" AS "id", "s"."term" AS "term", "instructors"."id" AS "instructors_id", "instructors"."displayName" AS "instructors_displayName", ci."courseId" AS "courseId", s."academicYear" AS "calendarYear" FROM "course_instance" "ci" LEFT JOIN "semester" "s" ON "s"."id" = ci."semesterId"  LEFT JOIN "FacultyListingView" "instructors" ON instructors."courseInstanceId" = "ci"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanInstanceView', 'SELECT "ci"."id" AS "id", "s"."term" AS "term", "instructors"."id" AS "instructors_id", "instructors"."displayName" AS "instructors_displayName", ci."courseId" AS "courseId", s."academicYear" AS "calendarYear" FROM "course_instance" "ci" LEFT JOIN "semester" "s" ON "s"."id" = ci."semesterId"  LEFT JOIN "FacultyListingView" "instructors" ON instructors."courseInstanceId" = "ci"."id"']);
    await queryRunner.query('CREATE VIEW "MultiYearPlanView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "a"."name" AS "area", "instances"."id" AS "instances_id", "instances"."courseId" AS "instances_courseId", "instances"."calendarYear" AS "calendarYear", "instances"."term" AS "instances_term", "instances"."calendarYear" AS "calendarYear", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", "instances"."calendarYear" AS "calendarYear" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"  LEFT JOIN "MultiYearPlanInstanceView" "instances" ON "c"."id" = "instances"."courseId"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanView', 'SELECT "c"."id" AS "id", "c"."title" AS "title", "a"."name" AS "area", "instances"."id" AS "instances_id", "instances"."courseId" AS "instances_courseId", "instances"."calendarYear" AS "calendarYear", "instances"."term" AS "instances_term", "instances"."calendarYear" AS "calendarYear", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", "instances"."calendarYear" AS "calendarYear" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"  LEFT JOIN "MultiYearPlanInstanceView" "instances" ON "c"."id" = "instances"."courseId"']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MultiYearPlanView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MultiYearPlanInstanceView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanInstanceView"', undefined);
  }
}
