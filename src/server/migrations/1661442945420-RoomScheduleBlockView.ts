import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration creates a table that consolidates all of the data that is
 * required to create the Room Schedule data, which shows the course instance
 * and faculty information for a selected room and semester.
 */
export class RoomScheduleBlockView1661442945420 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE VIEW "RoomScheduleBlockView" AS SELECT "c"."title" AS "title", "ci"."id" AS "courseInstanceId", "s"."term" AS "term", "m"."day" AS "weekday", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."isUndergraduate" AS "isUndergraduate", m."roomId" AS "roomId", s."academicYear" AS "calendarYear", EXTRACT(HOUR FROM m."startTime") AS "startHour", EXTRACT(MINUTE FROM m."startTime") AS "startMinute", EXTRACT(HOUR FROM m."endTime") AS "endHour", EXTRACT(MINUTE FROM m."endTime") AS "endMinute", EXTRACT(EPOCH FROM m."endTime"::TIME - m."startTime"::TIME) / 60 AS "duration", CONCAT("c"."prefix", "c"."number", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "id" FROM "course" "c" LEFT JOIN "course_instance" "ci" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomScheduleBlockView', "SELECT \"c\".\"title\" AS \"title\", \"ci\".\"id\" AS \"courseInstanceId\", \"s\".\"term\" AS \"term\", \"m\".\"day\" AS \"weekday\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"isUndergraduate\" AS \"isUndergraduate\", m.\"roomId\" AS \"roomId\", s.\"academicYear\" AS \"calendarYear\", EXTRACT(HOUR FROM m.\"startTime\") AS \"startHour\", EXTRACT(MINUTE FROM m.\"startTime\") AS \"startMinute\", EXTRACT(HOUR FROM m.\"endTime\") AS \"endHour\", EXTRACT(MINUTE FROM m.\"endTime\") AS \"endMinute\", EXTRACT(EPOCH FROM m.\"endTime\"::TIME - m.\"startTime\"::TIME) / 60 AS \"duration\", CONCAT(\"c\".\"prefix\", \"c\".\"number\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"id\" FROM \"course\" \"c\" LEFT JOIN \"course_instance\" \"ci\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\" WHERE c.\"isSEAS\" <> 'N'"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'RoomScheduleBlockView']);
    await queryRunner.query('DROP VIEW "RoomScheduleBlockView"');
  }
}
