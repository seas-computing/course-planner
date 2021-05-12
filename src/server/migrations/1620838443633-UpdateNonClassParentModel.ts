import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration adds additional fields to the [[NonclassParent]] model such
 * as `contactName`, `contactEmail`, `contactPhone` and `expectedSize` as well
 * as `area`
 *
 * This is to allow greater flexibility in how contact data is displayed on the
 * front end as well as provide administrators a place to store attendance info
 * against each [[NonClassParent]]
 *
 * All of this information is then also displayed in the [[NonClassParenttView]]
 */
export class UpdateNonClassParentModel1620838443633
implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" RENAME COLUMN "contact" TO "contactName"');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "contactEmail" character varying');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "contactPhone" character varying');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "notes" text');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "expectedSize" integer');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "areaId" uuid NOT NULL');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD CONSTRAINT "FK_0442b6914faf272482b32d939ae" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query(`CREATE VIEW "RoomBookingInfoView" AS SELECT "m"."day" AS "day", "r"."id" AS "roomId", "s"."term" AS "term", s."academicYear" AS "calendarYear", m."startTime" AS "startTime", m."endTime" AS "endTime", COALESCE(m."courseInstanceId", m."nonClassEventId") AS "parentId", CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', "c"."prefix", "c"."number")
               WHEN m."nonClassEventId" IS NOT NULL
               THEN "ncp"."title"
               END AS "meetingTitle" FROM "meeting" "m" LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "course_instance" "ci" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "non_class_event" "nce" ON m."nonClassEventId" = "nce"."id"  LEFT JOIN "non_class_parent" "ncp" ON nce."nonClassParentId" = "ncp"."id"  LEFT JOIN "semester" "s" ON COALESCE(ci."semesterId", nce."semesterId") = "s"."id"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomBookingInfoView', "SELECT \"m\".\"day\" AS \"day\", \"r\".\"id\" AS \"roomId\", \"s\".\"term\" AS \"term\", s.\"academicYear\" AS \"calendarYear\", m.\"startTime\" AS \"startTime\", m.\"endTime\" AS \"endTime\", COALESCE(m.\"courseInstanceId\", m.\"nonClassEventId\") AS \"parentId\", CASE\n               WHEN m.\"courseInstanceId\" IS NOT NULL\n               THEN CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\")\n               WHEN m.\"nonClassEventId\" IS NOT NULL\n               THEN \"ncp\".\"title\"\n               END AS \"meetingTitle\" FROM \"meeting\" \"m\" LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"course_instance\" \"ci\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"non_class_event\" \"nce\" ON m.\"nonClassEventId\" = \"nce\".\"id\"  LEFT JOIN \"non_class_parent\" \"ncp\" ON nce.\"nonClassParentId\" = \"ncp\".\"id\"  LEFT JOIN \"semester\" \"s\" ON COALESCE(ci.\"semesterId\", nce.\"semesterId\") = \"s\".\"id\""]);
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone", "parent"."notes" AS "notes", "parent"."expectedSize" AS "expectedSize", "area"."name" AS "area" FROM "non_class_parent" "parent" LEFT JOIN "area" "area" ON "area"."id" = parent."areaId"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone", "parent"."notes" AS "notes", "parent"."expectedSize" AS "expectedSize", "area"."name" AS "area" FROM "non_class_parent" "parent" LEFT JOIN "area" "area" ON "area"."id" = parent."areaId"']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomBookingInfoView']);
    await queryRunner.query('DROP VIEW "RoomBookingInfoView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP CONSTRAINT "FK_0442b6914faf272482b32d939ae"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "areaId"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "expectedSize"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "notes"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "contactPhone"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "contactEmail"');
    await queryRunner.query('ALTER TABLE "non_class_parent" RENAME COLUMN "contactName" TO "contact"');
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
