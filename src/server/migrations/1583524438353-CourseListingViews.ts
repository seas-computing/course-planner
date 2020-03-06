import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseListingViews1583524438353 implements MigrationInterface {
  public name = 'CourseListingViews1583524438353'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE VIEW "CourseListingView" AS SELECT "c"."id" AS "id", "c"."notes" AS "notes", "a"."name" AS "area", c."isUndergraduate" AS "isUndergraduate", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."sameAs" AS "sameAs", c."isSEAS" AS "isSEAS", c."termPattern" AS "termPattern" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'CourseListingView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"notes\" AS \"notes\", \"a\".\"name\" AS \"area\", c.\"isUndergraduate\" AS \"isUndergraduate\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"sameAs\" AS \"sameAs\", c.\"isSEAS\" AS \"isSEAS\", c.\"termPattern\" AS \"termPattern\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\""]);
    await queryRunner.query('CREATE VIEW "CourseInstanceListingView" AS SELECT "ci"."id" AS "id", "ci"."offered" AS "offered", "s"."term" AS "term", ci."courseId" AS "courseId", ci."preEnrollment" AS "preEnrollment", ci."studyCardEnrollment" AS "studyCardEnrollment", ci."actualEnrollment" AS "actualEnrollment", s."academicYear" AS "calendarYear" FROM "course_instance" "ci" LEFT JOIN "semester" "s" ON "s"."id" = ci."semesterId"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'CourseInstanceListingView', 'SELECT "ci"."id" AS "id", "ci"."offered" AS "offered", "s"."term" AS "term", ci."courseId" AS "courseId", ci."preEnrollment" AS "preEnrollment", ci."studyCardEnrollment" AS "studyCardEnrollment", ci."actualEnrollment" AS "actualEnrollment", s."academicYear" AS "calendarYear" FROM "course_instance" "ci" LEFT JOIN "semester" "s" ON "s"."id" = ci."semesterId"']);
    await queryRunner.query('CREATE VIEW "FacultyListingView" AS SELECT "f"."id" AS "id", "fci"."order" AS "instructorOrder", CONCAT_WS(\', \', f."lastName", f."firstName") AS "displayName", fci."courseInstanceId" AS "courseInstanceId" FROM "faculty" "f" LEFT JOIN "faculty_course_instances_course_instance" "fci" ON fci."facultyId" = "f"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'FacultyListingView', "SELECT \"f\".\"id\" AS \"id\", \"fci\".\"order\" AS \"instructorOrder\", CONCAT_WS(', ', f.\"lastName\", f.\"firstName\") AS \"displayName\", fci.\"courseInstanceId\" AS \"courseInstanceId\" FROM \"faculty\" \"f\" LEFT JOIN \"faculty_course_instances_course_instance\" \"fci\" ON fci.\"facultyId\" = \"f\".\"id\""]);
    await queryRunner.query('CREATE VIEW "RoomListingView" AS SELECT "r"."id" AS "id", CONCAT_WS(\' \', "b"."name", "r"."name") AS "name" FROM "room" "r" LEFT JOIN "building" "b" ON r."buildingId" = "b"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomListingView', "SELECT \"r\".\"id\" AS \"id\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"name\" FROM \"room\" \"r\" LEFT JOIN \"building\" \"b\" ON r.\"buildingId\" = \"b\".\"id\""]);
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\') AS "startTime", TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\') AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', "SELECT \"m\".\"id\" AS \"id\", \"m\".\"day\" AS \"day\", m.\"courseInstanceId\" AS \"courseInstanceId\", TO_CHAR(CAST (m.\"startTime\" AS TIME), 'HH12:MI AM') AS \"startTime\", TO_CHAR(CAST (m.\"endTime\" AS TIME), 'HH12:MI AM') AS \"endTime\", m.\"roomId\" AS \"roomId\" FROM \"meeting\" \"m\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomListingView']);
    await queryRunner.query('DROP VIEW "RoomListingView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'FacultyListingView']);
    await queryRunner.query('DROP VIEW "FacultyListingView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'CourseInstanceListingView']);
    await queryRunner.query('DROP VIEW "CourseInstanceListingView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'CourseListingView']);
    await queryRunner.query('DROP VIEW "CourseListingView"', undefined);
  }
}
