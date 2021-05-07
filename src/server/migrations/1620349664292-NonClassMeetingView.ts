import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration provides additional fields to record contact info in separate
 * fields like name, email and phone number
 */
export class NonClassMeetingView1620349664292 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" RENAME COLUMN "contact" TO "contactName";');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "contactEmail" character varying');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "contactPhone" character varying');
    await queryRunner.query(`CREATE VIEW "RoomBookingInfoView" AS SELECT "m"."day" AS "day", "r"."id" AS "roomId", "s"."term" AS "term", s."academicYear" AS "calendarYear", m."startTime" AS "startTime", m."endTime" AS "endTime", COALESCE(m."courseInstanceId", m."nonClassEventId") AS "parentId", CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', "c"."prefix", "c"."number")
               WHEN m."nonClassEventId" IS NOT NULL
               THEN "ncp"."title"
               END AS "meetingTitle" FROM "meeting" "m" LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "course_instance" "ci" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "non_class_event" "nce" ON m."nonClassEventId" = "nce"."id"  LEFT JOIN "non_class_parent" "ncp" ON nce."nonClassParentId" = "ncp"."id"  LEFT JOIN "semester" "s" ON COALESCE(ci."semesterId", nce."semesterId") = "s"."id"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomBookingInfoView', "SELECT \"m\".\"day\" AS \"day\", \"r\".\"id\" AS \"roomId\", \"s\".\"term\" AS \"term\", s.\"academicYear\" AS \"calendarYear\", m.\"startTime\" AS \"startTime\", m.\"endTime\" AS \"endTime\", COALESCE(m.\"courseInstanceId\", m.\"nonClassEventId\") AS \"parentId\", CASE\n               WHEN m.\"courseInstanceId\" IS NOT NULL\n               THEN CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\")\n               WHEN m.\"nonClassEventId\" IS NOT NULL\n               THEN \"ncp\".\"title\"\n               END AS \"meetingTitle\" FROM \"meeting\" \"m\" LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"course_instance\" \"ci\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"non_class_event\" \"nce\" ON m.\"nonClassEventId\" = \"nce\".\"id\"  LEFT JOIN \"non_class_parent\" \"ncp\" ON nce.\"nonClassParentId\" = \"ncp\".\"id\"  LEFT JOIN \"semester\" \"s\" ON COALESCE(ci.\"semesterId\", nce.\"semesterId\") = \"s\".\"id\""]);
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone" FROM "non_class_parent" "parent"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone" FROM "non_class_parent" "parent"']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "contactPhone"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "contactEmail"');
    await queryRunner.query('ALTER TABLE "non_class_parent" RENAME COLUMN "contactName" TO "contact";');
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contact" AS "contact" FROM "non_class_parent" "parent"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contact" AS "contact" FROM "non_class_parent" "parent"']);
    await queryRunner.query(`CREATE VIEW "RoomBookingInfoView" AS SELECT "m"."day" AS "day", "r"."id" AS "roomId", "s"."term" AS "term", s."academicYear" AS "calendarYear", m."startTime" AS "startTime", m."endTime" AS "endTime", CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', "c"."prefix", "c"."number")
               WHEN m."nonClassEventId" IS NOT NULL
               THEN "ncp"."title"
               END AS "meetingTitle" FROM "meeting" "m" LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "course_instance" "ci" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "non_class_event" "nce" ON m."nonClassEventId" = "nce"."id"  LEFT JOIN "non_class_parent" "ncp" ON nce."nonClassParentId" = "ncp"."id"  LEFT JOIN "semester" "s" ON COALESCE(ci."semesterId", nce."semesterId") = "s"."id"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomBookingInfoView', "SELECT \"m\".\"day\" AS \"day\", \"r\".\"id\" AS \"roomId\", \"s\".\"term\" AS \"term\", s.\"academicYear\" AS \"calendarYear\", m.\"startTime\" AS \"startTime\", m.\"endTime\" AS \"endTime\", CASE\n               WHEN m.\"courseInstanceId\" IS NOT NULL\n               THEN CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\")\n               WHEN m.\"nonClassEventId\" IS NOT NULL\n               THEN \"ncp\".\"title\"\n               END AS \"meetingTitle\" FROM \"meeting\" \"m\" LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"course_instance\" \"ci\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"non_class_event\" \"nce\" ON m.\"nonClassEventId\" = \"nce\".\"id\"  LEFT JOIN \"non_class_parent\" \"ncp\" ON nce.\"nonClassParentId\" = \"ncp\".\"id\"  LEFT JOIN \"semester\" \"s\" ON COALESCE(ci.\"semesterId\", nce.\"semesterId\") = \"s\".\"id\""]);
  }
}
