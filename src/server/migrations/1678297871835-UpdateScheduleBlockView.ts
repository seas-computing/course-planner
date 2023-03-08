import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration updates the ScheduleBlockView to compare the instance's course
 * ID with the sameAs value of the course if that exists. Since the
 * related ScheduleEntryView has been updated to do this, this migration is
 * fixing the mismatch between the ways the course instances were being joined
 * to the courses.
 */
export class UpdateScheduleBlockView1678297871835
implements MigrationInterface {
  name = 'UpdateScheduleBlockView1678297871835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'ScheduleBlockView']);
    await queryRunner.query('DROP VIEW "ScheduleBlockView"');
    await queryRunner.query('CREATE VIEW "ScheduleBlockView" AS SELECT DISTINCT "c"."prefix" AS "coursePrefix", "s"."term" AS "term", "m"."day" AS "weekday", s."academicYear" AS "calendarYear", EXTRACT(HOUR FROM m."startTime") AS "startHour", EXTRACT(MINUTE FROM m."startTime") AS "startMinute", EXTRACT(HOUR FROM m."endTime") AS "endHour", EXTRACT(MINUTE FROM m."endTime") AS "endMinute", EXTRACT(EPOCH FROM m."endTime"::TIME - m."startTime"::TIME) / 60 AS "duration", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "id" FROM "course" "c" LEFT JOIN "course_instance" "ci" ON ci."courseId" = COALESCE(c."sameAsId", "c"."id")  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id" GROUP BY "c"."prefix", "m"."day", s."academicYear", "s"."term", m."startTime", m."endTime", c."isSEAS" HAVING c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleBlockView', "SELECT DISTINCT \"c\".\"prefix\" AS \"coursePrefix\", \"s\".\"term\" AS \"term\", \"m\".\"day\" AS \"weekday\", s.\"academicYear\" AS \"calendarYear\", EXTRACT(HOUR FROM m.\"startTime\") AS \"startHour\", EXTRACT(MINUTE FROM m.\"startTime\") AS \"startMinute\", EXTRACT(HOUR FROM m.\"endTime\") AS \"endHour\", EXTRACT(MINUTE FROM m.\"endTime\") AS \"endMinute\", EXTRACT(EPOCH FROM m.\"endTime\"::TIME - m.\"startTime\"::TIME) / 60 AS \"duration\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"id\" FROM \"course\" \"c\" LEFT JOIN \"course_instance\" \"ci\" ON ci.\"courseId\" = COALESCE(c.\"sameAsId\", \"c\".\"id\")  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\" GROUP BY \"c\".\"prefix\", \"m\".\"day\", s.\"academicYear\", \"s\".\"term\", m.\"startTime\", m.\"endTime\", c.\"isSEAS\" HAVING c.\"isSEAS\" <> 'N'"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'ScheduleBlockView']);
    await queryRunner.query('DROP VIEW "ScheduleBlockView"');
    await queryRunner.query('CREATE VIEW "ScheduleBlockView" AS SELECT DISTINCT "c"."prefix" AS "coursePrefix", "s"."term" AS "term", "m"."day" AS "weekday", s."academicYear" AS "calendarYear", EXTRACT(HOUR FROM m."startTime") AS "startHour", EXTRACT(MINUTE FROM m."startTime") AS "startMinute", EXTRACT(HOUR FROM m."endTime") AS "endHour", EXTRACT(MINUTE FROM m."endTime") AS "endMinute", EXTRACT(EPOCH FROM m."endTime"::TIME - m."startTime"::TIME) / 60 AS "duration", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "id" FROM "course" "c" LEFT JOIN "course_instance" "ci" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id" GROUP BY "c"."prefix", "m"."day", s."academicYear", "s"."term", m."startTime", m."endTime", c."isSEAS" HAVING c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleBlockView', "SELECT DISTINCT \"c\".\"prefix\" AS \"coursePrefix\", \"s\".\"term\" AS \"term\", \"m\".\"day\" AS \"weekday\", s.\"academicYear\" AS \"calendarYear\", EXTRACT(HOUR FROM m.\"startTime\") AS \"startHour\", EXTRACT(MINUTE FROM m.\"startTime\") AS \"startMinute\", EXTRACT(HOUR FROM m.\"endTime\") AS \"endHour\", EXTRACT(MINUTE FROM m.\"endTime\") AS \"endMinute\", EXTRACT(EPOCH FROM m.\"endTime\"::TIME - m.\"startTime\"::TIME) / 60 AS \"duration\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"id\" FROM \"course\" \"c\" LEFT JOIN \"course_instance\" \"ci\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\" GROUP BY \"c\".\"prefix\", \"m\".\"day\", s.\"academicYear\", \"s\".\"term\", m.\"startTime\", m.\"endTime\", c.\"isSEAS\" HAVING c.\"isSEAS\" <> 'N'"]);
  }
}
