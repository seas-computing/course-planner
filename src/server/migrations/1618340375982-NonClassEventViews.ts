import { MigrationInterface, QueryRunner } from 'typeorm';

/**
* This migration creates two views (`NonClassParentview` and
* `NonClassEventView`) which are aggregated from other tables. This is because
* the [[NonClassParent]] and [[NonclassEvent]] tables do not have the concept
* of an academic year, and instead get this information via the relation to
* [[Course]], and then [[Semester]].
*
* This also adds a relationship between [[MeetingListingView]] and
* [[NonClassEventView]] so that we can more easily GET/PUT meetings associated
* with non-class events
*/
export class NonClassEventViews1618340375982 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"');
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contact" AS "contact" FROM "non_class_parent" "parent"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contact" AS "contact" FROM "non_class_parent" "parent"']);
    await queryRunner.query(`CREATE VIEW "NonClassEventView" AS SELECT "event"."id" AS "id", "s"."term" AS "term", event."nonClassParentId" AS "nonClassParentId", CASE
        WHEN term = 'FALL' THEN "s"."academicYear" + 1
        ELSE "s"."academicYear"
      END AS "academicYear", event."semesterId" AS "semesterId" FROM "non_class_event" "event" LEFT JOIN "semester" "s" ON "s"."id" = event."semesterId"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassEventView', "SELECT \"event\".\"id\" AS \"id\", \"s\".\"term\" AS \"term\", event.\"nonClassParentId\" AS \"nonClassParentId\", CASE\n        WHEN term = 'FALL' THEN \"s\".\"academicYear\" + 1\n        ELSE \"s\".\"academicYear\"\n      END AS \"academicYear\", event.\"semesterId\" AS \"semesterId\" FROM \"non_class_event\" \"event\" LEFT JOIN \"semester\" \"s\" ON \"s\".\"id\" = event.\"semesterId\""]);
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", m."nonClassEventId" AS "nonClassEventId", TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\') AS "startTime", TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\') AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', "SELECT \"m\".\"id\" AS \"id\", \"m\".\"day\" AS \"day\", m.\"courseInstanceId\" AS \"courseInstanceId\", m.\"nonClassEventId\" AS \"nonClassEventId\", TO_CHAR(CAST (m.\"startTime\" AS TIME), 'HH12:MI AM') AS \"startTime\", TO_CHAR(CAST (m.\"endTime\" AS TIME), 'HH12:MI AM') AS \"endTime\", m.\"roomId\" AS \"roomId\" FROM \"meeting\" \"m\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassEventView']);
    await queryRunner.query('DROP VIEW "NonClassEventView"');
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\') AS "startTime", TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\') AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', "SELECT \"m\".\"id\" AS \"id\", \"m\".\"day\" AS \"day\", m.\"courseInstanceId\" AS \"courseInstanceId\", TO_CHAR(CAST (m.\"startTime\" AS TIME), 'HH12:MI AM') AS \"startTime\", TO_CHAR(CAST (m.\"endTime\" AS TIME), 'HH12:MI AM') AS \"endTime\", m.\"roomId\" AS \"roomId\" FROM \"meeting\" \"m\""]);
  }
}
