import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates a table that consolidates all of the data about when and why rooms
 * have been booked. Can in turn be joined with the RoomListingView to get the
 * details about the room itself.
 */
export class RoomBookingInfoView1615476024313 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE VIEW "RoomBookingInfoView" AS SELECT "m"."day" AS "day", "r"."id" AS "roomId", "s"."term" AS "term", s."academicYear" AS "calendarYear", m."startTime" AS "startTime", m."endTime" AS "endTime", CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', "c"."prefix", "c"."number")
               WHEN m."nonClassEventId" IS NOT NULL
               THEN "nce"."title"
               END AS "meetingTitle" FROM "meeting" "m" LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "course_instance" "ci" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "non_class_event" "nce" ON m."nonClassEventId" = "nce"."id"  LEFT JOIN "non_class_parent" "ncp" ON nce."nonClassParentId" = "ncp"."id"  LEFT JOIN "semester" "s" ON COALESCE(ci."semesterId", nce."semesterId") = "s"."id"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomBookingInfoView', "SELECT \"m\".\"day\" AS \"day\", \"r\".\"id\" AS \"roomId\", \"s\".\"term\" AS \"term\", s.\"academicYear\" AS \"calendarYear\", m.\"startTime\" AS \"startTime\", m.\"endTime\" AS \"endTime\", CASE\n               WHEN m.\"courseInstanceId\" IS NOT NULL\n               THEN CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\")\n               WHEN m.\"nonClassEventId\" IS NOT NULL\n               THEN \"nce\".\"title\"\n               END AS \"meetingTitle\" FROM \"meeting\" \"m\" LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"course_instance\" \"ci\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"non_class_event\" \"nce\" ON m.\"nonClassEventId\" = \"nce\".\"id\"  LEFT JOIN \"non_class_parent\" \"ncp\" ON nce.\"nonClassParentId\" = \"ncp\".\"id\"  LEFT JOIN \"semester\" \"s\" ON COALESCE(ci.\"semesterId\", nce.\"semesterId\") = \"s\".\"id\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
  }
}
