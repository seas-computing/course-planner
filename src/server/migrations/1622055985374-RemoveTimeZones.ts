import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Because several of our views rely on the startTime and endTime columns,
 * we'll need to drop and recreate all of the views in order to change the
 * column types.
 */

export class RemoveTimeZones1622055985374 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'ScheduleBlockView']);
    await queryRunner.query('DROP VIEW "ScheduleBlockView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'ScheduleEntryView']);
    await queryRunner.query('DROP VIEW "ScheduleEntryView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
    await queryRunner.query('ALTER TABLE "meeting" DROP COLUMN "startTime"');
    await queryRunner.query('ALTER TABLE "meeting" ADD "startTime" TIME NOT NULL');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."startTime" IS \'The time of day this event (meeting) begins in 24 hour time (e.g "19:15:40")\'');
    await queryRunner.query('ALTER TABLE "meeting" DROP COLUMN "endTime"');
    await queryRunner.query('ALTER TABLE "meeting" ADD "endTime" TIME NOT NULL');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."endTime" IS \'The time of day this event (meeting) ends in 24 hour time (e.g "19:15:40")\'');
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", m."nonClassEventId" AS "nonClassEventId", TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\') AS "startTime", TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\') AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', "SELECT \"m\".\"id\" AS \"id\", \"m\".\"day\" AS \"day\", m.\"courseInstanceId\" AS \"courseInstanceId\", m.\"nonClassEventId\" AS \"nonClassEventId\", TO_CHAR(CAST (m.\"startTime\" AS TIME), 'HH12:MI AM') AS \"startTime\", TO_CHAR(CAST (m.\"endTime\" AS TIME), 'HH12:MI AM') AS \"endTime\", m.\"roomId\" AS \"roomId\" FROM \"meeting\" \"m\""]);
    await queryRunner.query('CREATE VIEW "ScheduleEntryView" AS SELECT "c"."number" AS "courseNumber", "c"."isUndergraduate" AS "isUndergraduate", "m"."id" AS "id", "campus"."name" AS "campus", CONCAT_WS(\' \', "b"."name", "r"."name") AS "room", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "blockId" FROM "course_instance" "ci" LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "building" "b" ON "b"."id" = r."buildingId"  LEFT JOIN "campus" "campus" ON "campus"."id" = b."campusId" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleEntryView', "SELECT \"c\".\"number\" AS \"courseNumber\", \"c\".\"isUndergraduate\" AS \"isUndergraduate\", \"m\".\"id\" AS \"id\", \"campus\".\"name\" AS \"campus\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"room\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"blockId\" FROM \"course_instance\" \"ci\" LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"building\" \"b\" ON \"b\".\"id\" = r.\"buildingId\"  LEFT JOIN \"campus\" \"campus\" ON \"campus\".\"id\" = b.\"campusId\" WHERE c.\"isSEAS\" <> 'N'"]);
    await queryRunner.query('CREATE VIEW "ScheduleBlockView" AS SELECT DISTINCT "c"."prefix" AS "coursePrefix", "s"."term" AS "term", "m"."day" AS "weekday", s."academicYear" AS "calendarYear", EXTRACT(HOUR FROM m."startTime") AS "startHour", EXTRACT(MINUTE FROM m."startTime") AS "startMinute", EXTRACT(HOUR FROM m."endTime") AS "endHour", EXTRACT(MINUTE FROM m."endTime") AS "endMinute", EXTRACT(EPOCH FROM m."endTime"::TIME - m."startTime"::TIME) / 60 AS "duration", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "id" FROM "course" "c" LEFT JOIN "course_instance" "ci" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id"  GROUP BY "c"."prefix", "m"."day", s."academicYear", "s"."term", m."startTime", m."endTime", c."isSEAS" HAVING c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleBlockView', "SELECT DISTINCT \"c\".\"prefix\" AS \"coursePrefix\", \"s\".\"term\" AS \"term\", \"m\".\"day\" AS \"weekday\", s.\"academicYear\" AS \"calendarYear\", EXTRACT(HOUR FROM m.\"startTime\") AS \"startHour\", EXTRACT(MINUTE FROM m.\"startTime\") AS \"startMinute\", EXTRACT(HOUR FROM m.\"endTime\") AS \"endHour\", EXTRACT(MINUTE FROM m.\"endTime\") AS \"endMinute\", EXTRACT(EPOCH FROM m.\"endTime\"::TIME - m.\"startTime\"::TIME) / 60 AS \"duration\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"id\" FROM \"course\" \"c\" LEFT JOIN \"course_instance\" \"ci\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  GROUP BY \"c\".\"prefix\", \"m\".\"day\", s.\"academicYear\", \"s\".\"term\", m.\"startTime\", m.\"endTime\", c.\"isSEAS\" HAVING c.\"isSEAS\" <> 'N'"]);
    await queryRunner.query(`CREATE VIEW "RoomBookingInfoView" AS SELECT "m"."day" AS "day", "r"."id" AS "roomId", "s"."term" AS "term", s."academicYear" AS "calendarYear", m."startTime" AS "startTime", m."endTime" AS "endTime", COALESCE(m."courseInstanceId", m."nonClassEventId") AS "parentId", CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', "c"."prefix", "c"."number")
               WHEN m."nonClassEventId" IS NOT NULL
               THEN "ncp"."title"
               END AS "meetingTitle" FROM "meeting" "m" LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "course_instance" "ci" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "non_class_event" "nce" ON m."nonClassEventId" = "nce"."id"  LEFT JOIN "non_class_parent" "ncp" ON nce."nonClassParentId" = "ncp"."id"  LEFT JOIN "semester" "s" ON COALESCE(ci."semesterId", nce."semesterId") = "s"."id"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomBookingInfoView', "SELECT \"m\".\"day\" AS \"day\", \"r\".\"id\" AS \"roomId\", \"s\".\"term\" AS \"term\", s.\"academicYear\" AS \"calendarYear\", m.\"startTime\" AS \"startTime\", m.\"endTime\" AS \"endTime\", COALESCE(m.\"courseInstanceId\", m.\"nonClassEventId\") AS \"parentId\", CASE\n               WHEN m.\"courseInstanceId\" IS NOT NULL\n               THEN CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\")\n               WHEN m.\"nonClassEventId\" IS NOT NULL\n               THEN \"ncp\".\"title\"\n               END AS \"meetingTitle\" FROM \"meeting\" \"m\" LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"course_instance\" \"ci\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"non_class_event\" \"nce\" ON m.\"nonClassEventId\" = \"nce\".\"id\"  LEFT JOIN \"non_class_parent\" \"ncp\" ON nce.\"nonClassParentId\" = \"ncp\".\"id\"  LEFT JOIN \"semester\" \"s\" ON COALESCE(ci.\"semesterId\", nce.\"semesterId\") = \"s\".\"id\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'ScheduleBlockView']);
    await queryRunner.query('DROP VIEW "ScheduleBlockView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'ScheduleEntryView']);
    await queryRunner.query('DROP VIEW "ScheduleEntryView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."endTime" IS \'The time of day this event (meeting) ends in 24 hour time (e.g "19:15:40")\'');
    await queryRunner.query('ALTER TABLE "meeting" DROP COLUMN "endTime"');
    await queryRunner.query('ALTER TABLE "meeting" ADD "endTime" TIME WITH TIME ZONE NOT NULL');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."startTime" IS \'The time of day this event (meeting) begins in 24 hour time (e.g "19:15:40")\'');
    await queryRunner.query('ALTER TABLE "meeting" DROP COLUMN "startTime"');
    await queryRunner.query('ALTER TABLE "meeting" ADD "startTime" TIME WITH TIME ZONE NOT NULL');
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", m."nonClassEventId" AS "nonClassEventId", TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\') AS "startTime", TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\') AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', "SELECT \"m\".\"id\" AS \"id\", \"m\".\"day\" AS \"day\", m.\"courseInstanceId\" AS \"courseInstanceId\", m.\"nonClassEventId\" AS \"nonClassEventId\", TO_CHAR(CAST (m.\"startTime\" AS TIME), 'HH12:MI AM') AS \"startTime\", TO_CHAR(CAST (m.\"endTime\" AS TIME), 'HH12:MI AM') AS \"endTime\", m.\"roomId\" AS \"roomId\" FROM \"meeting\" \"m\""]);
    await queryRunner.query('CREATE VIEW "ScheduleEntryView" AS SELECT "c"."number" AS "courseNumber", "c"."isUndergraduate" AS "isUndergraduate", "m"."id" AS "id", "campus"."name" AS "campus", CONCAT_WS(\' \', "b"."name", "r"."name") AS "room", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "blockId" FROM "course_instance" "ci" LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "building" "b" ON "b"."id" = r."buildingId"  LEFT JOIN "campus" "campus" ON "campus"."id" = b."campusId" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleEntryView', "SELECT \"c\".\"number\" AS \"courseNumber\", \"c\".\"isUndergraduate\" AS \"isUndergraduate\", \"m\".\"id\" AS \"id\", \"campus\".\"name\" AS \"campus\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"room\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"blockId\" FROM \"course_instance\" \"ci\" LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"building\" \"b\" ON \"b\".\"id\" = r.\"buildingId\"  LEFT JOIN \"campus\" \"campus\" ON \"campus\".\"id\" = b.\"campusId\" WHERE c.\"isSEAS\" <> 'N'"]);
    await queryRunner.query('CREATE VIEW "ScheduleBlockView" AS SELECT DISTINCT "c"."prefix" AS "coursePrefix", "s"."term" AS "term", "m"."day" AS "weekday", s."academicYear" AS "calendarYear", EXTRACT(HOUR FROM m."startTime") AS "startHour", EXTRACT(MINUTE FROM m."startTime") AS "startMinute", EXTRACT(HOUR FROM m."endTime") AS "endHour", EXTRACT(MINUTE FROM m."endTime") AS "endMinute", EXTRACT(EPOCH FROM m."endTime"::TIME - m."startTime"::TIME) / 60 AS "duration", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "id" FROM "course" "c" LEFT JOIN "course_instance" "ci" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id"  GROUP BY "c"."prefix", "m"."day", s."academicYear", "s"."term", m."startTime", m."endTime", c."isSEAS" HAVING c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleBlockView', "SELECT DISTINCT \"c\".\"prefix\" AS \"coursePrefix\", \"s\".\"term\" AS \"term\", \"m\".\"day\" AS \"weekday\", s.\"academicYear\" AS \"calendarYear\", EXTRACT(HOUR FROM m.\"startTime\") AS \"startHour\", EXTRACT(MINUTE FROM m.\"startTime\") AS \"startMinute\", EXTRACT(HOUR FROM m.\"endTime\") AS \"endHour\", EXTRACT(MINUTE FROM m.\"endTime\") AS \"endMinute\", EXTRACT(EPOCH FROM m.\"endTime\"::TIME - m.\"startTime\"::TIME) / 60 AS \"duration\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"id\" FROM \"course\" \"c\" LEFT JOIN \"course_instance\" \"ci\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  GROUP BY \"c\".\"prefix\", \"m\".\"day\", s.\"academicYear\", \"s\".\"term\", m.\"startTime\", m.\"endTime\", c.\"isSEAS\" HAVING c.\"isSEAS\" <> 'N'"]);
    await queryRunner.query(`CREATE VIEW "RoomBookingInfoView" AS SELECT "m"."day" AS "day", "r"."id" AS "roomId", "s"."term" AS "term", s."academicYear" AS "calendarYear", m."startTime" AS "startTime", m."endTime" AS "endTime", COALESCE(m."courseInstanceId", m."nonClassEventId") AS "parentId", CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', "c"."prefix", "c"."number")
               WHEN m."nonClassEventId" IS NOT NULL
               THEN "ncp"."title"
               END AS "meetingTitle" FROM "meeting" "m" LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "course_instance" "ci" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "non_class_event" "nce" ON m."nonClassEventId" = "nce"."id"  LEFT JOIN "non_class_parent" "ncp" ON nce."nonClassParentId" = "ncp"."id"  LEFT JOIN "semester" "s" ON COALESCE(ci."semesterId", nce."semesterId") = "s"."id"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomBookingInfoView', "SELECT \"m\".\"day\" AS \"day\", \"r\".\"id\" AS \"roomId\", \"s\".\"term\" AS \"term\", s.\"academicYear\" AS \"calendarYear\", m.\"startTime\" AS \"startTime\", m.\"endTime\" AS \"endTime\", COALESCE(m.\"courseInstanceId\", m.\"nonClassEventId\") AS \"parentId\", CASE\n               WHEN m.\"courseInstanceId\" IS NOT NULL\n               THEN CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\")\n               WHEN m.\"nonClassEventId\" IS NOT NULL\n               THEN \"ncp\".\"title\"\n               END AS \"meetingTitle\" FROM \"meeting\" \"m\" LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"course_instance\" \"ci\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"non_class_event\" \"nce\" ON m.\"nonClassEventId\" = \"nce\".\"id\"  LEFT JOIN \"non_class_parent\" \"ncp\" ON nce.\"nonClassParentId\" = \"ncp\".\"id\"  LEFT JOIN \"semester\" \"s\" ON COALESCE(ci.\"semesterId\", nce.\"semesterId\") = \"s\".\"id\""]);
  }
}