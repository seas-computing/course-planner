import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration creates a table that consolidates all of the data that is
 * required to create the Room Schedule data, which shows the course instance
 * and faculty information for a selected room and semester.
 */
export class RoomScheduleBlockView1660758885518 implements MigrationInterface {
  name = 'RoomScheduleBlockView1660758885518';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."contactName" IS \'The faculty member name for a given event. This is recorded here as it does not regularly change between events.\'');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."contactEmail" IS \'The contact email for a given non class parent. This is recorded here as it does not regularly change between events.\'');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."contactPhone" IS \'The contact phone number for a given non class parent. This is recorded here as it does not regularly change between events.\'');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."notes" IS \'Any notes users may wish to record against this NonClassParent can be recorded here\'');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."expectedSize" IS \'Expected enrollment size for this academic year\'');
    await queryRunner.query('CREATE VIEW "RoomScheduleBlockView" AS SELECT "c"."title" AS "title", "s"."term" AS "term", "m"."day" AS "weekday", "instructors"."id" AS "instructors_id", "instructors"."displayName" AS "instructors_displayName", "instructors"."notes" AS "instructors_notes", "instructors"."instructorOrder" AS "instructors_instructorOrder", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."isUndergraduate" AS "isUndergraduate", m."roomId" AS "roomId", s."academicYear" AS "calendarYear", EXTRACT(HOUR FROM m."startTime") AS "startHour", EXTRACT(MINUTE FROM m."startTime") AS "startMinute", EXTRACT(HOUR FROM m."endTime") AS "endHour", EXTRACT(MINUTE FROM m."endTime") AS "endMinute", EXTRACT(EPOCH FROM m."endTime"::TIME - m."startTime"::TIME) / 60 AS "duration", CONCAT("c"."prefix", "c"."number", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "id" FROM "course" "c" LEFT JOIN "course_instance" "ci" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "FacultyListingView" "instructors" ON instructors."courseInstanceId" = "ci"."id" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomScheduleBlockView', "SELECT \"c\".\"title\" AS \"title\", \"s\".\"term\" AS \"term\", \"m\".\"day\" AS \"weekday\", \"instructors\".\"id\" AS \"instructors_id\", \"instructors\".\"displayName\" AS \"instructors_displayName\", \"instructors\".\"notes\" AS \"instructors_notes\", \"instructors\".\"instructorOrder\" AS \"instructors_instructorOrder\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"isUndergraduate\" AS \"isUndergraduate\", m.\"roomId\" AS \"roomId\", s.\"academicYear\" AS \"calendarYear\", EXTRACT(HOUR FROM m.\"startTime\") AS \"startHour\", EXTRACT(MINUTE FROM m.\"startTime\") AS \"startMinute\", EXTRACT(HOUR FROM m.\"endTime\") AS \"endHour\", EXTRACT(MINUTE FROM m.\"endTime\") AS \"endMinute\", EXTRACT(EPOCH FROM m.\"endTime\"::TIME - m.\"startTime\"::TIME) / 60 AS \"duration\", CONCAT(\"c\".\"prefix\", \"c\".\"number\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"id\" FROM \"course\" \"c\" LEFT JOIN \"course_instance\" \"ci\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"FacultyListingView\" \"instructors\" ON instructors.\"courseInstanceId\" = \"ci\".\"id\" WHERE c.\"isSEAS\" <> 'N'"]);
    await queryRunner.query(`CREATE VIEW "RoomBookingInfoView" AS SELECT "m"."day" AS "day", "r"."id" AS "roomId", "s"."term" AS "term", CONCAT_WS(' ', "b"."name", "r"."name") AS "roomName", s."academicYear" AS "calendarYear", m."startTime" AS "startTime", m."endTime" AS "endTime", COALESCE(m."courseInstanceId", m."nonClassEventId") AS "parentId", CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', "c"."prefix", "c"."number")
               WHEN m."nonClassEventId" IS NOT NULL
               THEN "ncp"."title"
               END AS "meetingTitle" FROM "meeting" "m" LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "building" "b" ON "b"."id" = r."buildingId"  LEFT JOIN "course_instance" "ci" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "non_class_event" "nce" ON m."nonClassEventId" = "nce"."id"  LEFT JOIN "non_class_parent" "ncp" ON nce."nonClassParentId" = "ncp"."id"  LEFT JOIN "semester" "s" ON COALESCE(ci."semesterId", nce."semesterId") = "s"."id"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomBookingInfoView', "SELECT \"m\".\"day\" AS \"day\", \"r\".\"id\" AS \"roomId\", \"s\".\"term\" AS \"term\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"roomName\", s.\"academicYear\" AS \"calendarYear\", m.\"startTime\" AS \"startTime\", m.\"endTime\" AS \"endTime\", COALESCE(m.\"courseInstanceId\", m.\"nonClassEventId\") AS \"parentId\", CASE\n               WHEN m.\"courseInstanceId\" IS NOT NULL\n               THEN CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\")\n               WHEN m.\"nonClassEventId\" IS NOT NULL\n               THEN \"ncp\".\"title\"\n               END AS \"meetingTitle\" FROM \"meeting\" \"m\" LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"building\" \"b\" ON \"b\".\"id\" = r.\"buildingId\"  LEFT JOIN \"course_instance\" \"ci\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"non_class_event\" \"nce\" ON m.\"nonClassEventId\" = \"nce\".\"id\"  LEFT JOIN \"non_class_parent\" \"ncp\" ON nce.\"nonClassParentId\" = \"ncp\".\"id\"  LEFT JOIN \"semester\" \"s\" ON COALESCE(ci.\"semesterId\", nce.\"semesterId\") = \"s\".\"id\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'RoomScheduleBlockView']);
    await queryRunner.query('DROP VIEW "RoomScheduleBlockView"');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."expectedSize" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."notes" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."contactPhone" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."contactEmail" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "non_class_parent"."contactName" IS NULL');
    await queryRunner.query(`CREATE VIEW "RoomBookingInfoView" AS SELECT "m"."day" AS "day", "r"."id" AS "roomId", "s"."term" AS "term", CONCAT_WS(' ', "b"."name", "r"."name") AS "roomName", s."academicYear" AS "calendarYear", m."startTime" AS "startTime", m."endTime" AS "endTime", COALESCE(m."courseInstanceId", m."nonClassEventId") AS "parentId", CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', "c"."prefix", "c"."number")
               WHEN m."nonClassEventId" IS NOT NULL
               THEN "ncp"."title"
               END AS "meetingTitle" FROM "meeting" "m" LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "building" "b" ON "b"."id" = "r"."buildingId"  LEFT JOIN "course_instance" "ci" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "non_class_event" "nce" ON m."nonClassEventId" = "nce"."id"  LEFT JOIN "non_class_parent" "ncp" ON nce."nonClassParentId" = "ncp"."id"  LEFT JOIN "semester" "s" ON COALESCE(ci."semesterId", nce."semesterId") = "s"."id"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomBookingInfoView', "SELECT \"m\".\"day\" AS \"day\", \"r\".\"id\" AS \"roomId\", \"s\".\"term\" AS \"term\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"roomName\", s.\"academicYear\" AS \"calendarYear\", m.\"startTime\" AS \"startTime\", m.\"endTime\" AS \"endTime\", COALESCE(m.\"courseInstanceId\", m.\"nonClassEventId\") AS \"parentId\", CASE\n               WHEN m.\"courseInstanceId\" IS NOT NULL\n               THEN CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\")\n               WHEN m.\"nonClassEventId\" IS NOT NULL\n               THEN \"ncp\".\"title\"\n               END AS \"meetingTitle\" FROM \"meeting\" \"m\" LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"building\" \"b\" ON \"b\".\"id\" = \"r\".\"buildingId\"  LEFT JOIN \"course_instance\" \"ci\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"non_class_event\" \"nce\" ON m.\"nonClassEventId\" = \"nce\".\"id\"  LEFT JOIN \"non_class_parent\" \"ncp\" ON nce.\"nonClassParentId\" = \"ncp\".\"id\"  LEFT JOIN \"semester\" \"s\" ON COALESCE(ci.\"semesterId\", nce.\"semesterId\") = \"s\".\"id\""]);
  }
}