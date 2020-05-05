import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration adds a view which can be queried for data about multiple years
 * of faculty.
 * In particular, this can be used to retrieve the data required for the Faculty
 * tab.
 */
export class FacultyScheduleViews1588692875013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE VIEW "FacultyScheduleCourseView" AS SELECT fci."courseInstanceId" AS "courseInstanceId", fci."facultyId" AS "facultyId", ci."semesterId" AS "semesterId", ci."courseId" AS "id", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber" FROM "faculty_course_instances_course_instance" "fci" LEFT JOIN "course_instance" "ci" ON "ci"."id" = fci."courseInstanceId"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'FacultyScheduleCourseView', "SELECT fci.\"courseInstanceId\" AS \"courseInstanceId\", fci.\"facultyId\" AS \"facultyId\", ci.\"semesterId\" AS \"semesterId\", ci.\"courseId\" AS \"id\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\" FROM \"faculty_course_instances_course_instance\" \"fci\" LEFT JOIN \"course_instance\" \"ci\" ON \"ci\".\"id\" = fci.\"courseInstanceId\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\""]);
    await queryRunner.query(`CREATE VIEW "FacultyScheduleSemesterView" AS SELECT "semester"."id" AS "id", "semester"."term" AS "term", CASE
      WHEN term = 'FALL' THEN semester."academicYear" + 1
      ELSE semester."academicYear"
    END AS "academicYear" FROM "semester" "semester"`, undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'FacultyScheduleSemesterView', "SELECT \"semester\".\"id\" AS \"id\", \"semester\".\"term\" AS \"term\", CASE\n      WHEN term = 'FALL' THEN semester.\"academicYear\" + 1\n      ELSE semester.\"academicYear\"\n    END AS \"academicYear\" FROM \"semester\" \"semester\""]);
    await queryRunner.query('CREATE VIEW "FacultyScheduleView" AS SELECT "faculty"."id" AS "id", "faculty"."category" AS "category", "area"."name" AS "area", faculty."lastName" AS "lastName", faculty."firstName" AS "firstName", faculty."jointWith" AS "jointWith" FROM "faculty" "faculty" LEFT JOIN "area" "area" ON faculty."areaId" = "area"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'FacultyScheduleView', 'SELECT "faculty"."id" AS "id", "faculty"."category" AS "category", "area"."name" AS "area", faculty."lastName" AS "lastName", faculty."firstName" AS "firstName", faculty."jointWith" AS "jointWith" FROM "faculty" "faculty" LEFT JOIN "area" "area" ON faculty."areaId" = "area"."id"']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'FacultyScheduleView']);
    await queryRunner.query('DROP VIEW "FacultyScheduleView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'FacultyScheduleSemesterView']);
    await queryRunner.query('DROP VIEW "FacultyScheduleSemesterView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'FacultyScheduleCourseView']);
    await queryRunner.query('DROP VIEW "FacultyScheduleCourseView"', undefined);
  }
}
