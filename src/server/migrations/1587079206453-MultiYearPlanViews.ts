import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration adds a view which can be queried for data about multiple years
 * of course plans.
 * In particular, this can be used to retrieve the data required for the 4 Year
 * Plan tab.
 */
export class MultiYearPlanViews1587079206453 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE VIEW "MultiYearPlanInstanceView" AS SELECT "ci"."id" AS "id", "s"."academicYear" AS "calendarYear", "s"."term" AS "term", ci."courseId" AS "courseId", CASE
        WHEN term = 'FALL' THEN "s"."academicYear" + 1
        ELSE "s"."academicYear"
      END AS "academicYear", instructors."instructorOrder" AS "instructorOrder" FROM "course_instance" "ci" LEFT JOIN "semester" "s" ON "s"."id" = ci."semesterId"  LEFT JOIN "FacultyListingView" "instructors" ON instructors."courseInstanceId" = "ci"."id"`, undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanInstanceView', "SELECT \"ci\".\"id\" AS \"id\", \"s\".\"academicYear\" AS \"calendarYear\", \"s\".\"term\" AS \"term\", ci.\"courseId\" AS \"courseId\", CASE\n        WHEN term = 'FALL' THEN \"s\".\"academicYear\" + 1\n        ELSE \"s\".\"academicYear\"\n      END AS \"academicYear\", instructors.\"instructorOrder\" AS \"instructorOrder\" FROM \"course_instance\" \"ci\" LEFT JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  LEFT JOIN \"FacultyListingView\" \"instructors\" ON instructors.\"courseInstanceId\" = \"ci\".\"id\""]);
    await queryRunner.query('CREATE VIEW "MultiYearPlanView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "a"."name" AS "area", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", instances."academicYear" AS "instances_academicYear" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"  LEFT JOIN "MultiYearPlanInstanceView" "instances" ON "c"."id" = instances."courseId" ORDER BY area ASC, "catalogNumber" ASC, instances."instructorOrder" ASC', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"a\".\"name\" AS \"area\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", instances.\"academicYear\" AS \"instances_academicYear\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\"  LEFT JOIN \"MultiYearPlanInstanceView\" \"instances\" ON \"c\".\"id\" = instances.\"courseId\" ORDER BY area ASC, \"catalogNumber\" ASC, instances.\"instructorOrder\" ASC"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MultiYearPlanView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MultiYearPlanInstanceView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanInstanceView"', undefined);
  }
}
