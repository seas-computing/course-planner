import { MigrationInterface, QueryRunner } from 'typeorm';

export class NonClassEventViews1592340148882 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"', undefined);
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contact" AS "contact", parent."courseId" AS "courseId" FROM "non_class_parent" "parent"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contact" AS "contact", parent."courseId" AS "courseId" FROM "non_class_parent" "parent"']);
    await queryRunner.query(`CREATE VIEW "NonClassEventView" AS SELECT "event"."id" AS "id", "s"."term" AS "term", event."nonClassParentId" AS "nonClassParentId", CASE
        WHEN term = 'FALL' THEN "s"."academicYear" + 1
        ELSE "s"."academicYear"
      END AS "academicYear", event."semesterId" AS "semesterId" FROM "non_class_event" "event" LEFT JOIN "semester" "s" ON "s"."id" = event."semesterId"`, undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassEventView', "SELECT \"event\".\"id\" AS \"id\", \"s\".\"term\" AS \"term\", event.\"nonClassParentId\" AS \"nonClassParentId\", CASE\n        WHEN term = 'FALL' THEN \"s\".\"academicYear\" + 1\n        ELSE \"s\".\"academicYear\"\n      END AS \"academicYear\", event.\"semesterId\" AS \"semesterId\" FROM \"non_class_event\" \"event\" LEFT JOIN \"semester\" \"s\" ON \"s\".\"id\" = event.\"semesterId\""]);
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", m."nonClassEventId" AS "nonClassEventId", TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\') AS "startTime", TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\') AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', "SELECT \"m\".\"id\" AS \"id\", \"m\".\"day\" AS \"day\", m.\"courseInstanceId\" AS \"courseInstanceId\", m.\"nonClassEventId\" AS \"nonClassEventId\", TO_CHAR(CAST (m.\"startTime\" AS TIME), 'HH12:MI AM') AS \"startTime\", TO_CHAR(CAST (m.\"endTime\" AS TIME), 'HH12:MI AM') AS \"endTime\", m.\"roomId\" AS \"roomId\" FROM \"meeting\" \"m\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassEventView']);
    await queryRunner.query('DROP VIEW "NonClassEventView"', undefined);
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"', undefined);
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\') AS "startTime", TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\') AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', "SELECT \"m\".\"id\" AS \"id\", \"m\".\"day\" AS \"day\", m.\"courseInstanceId\" AS \"courseInstanceId\", TO_CHAR(CAST (m.\"startTime\" AS TIME), 'HH12:MI AM') AS \"startTime\", TO_CHAR(CAST (m.\"endTime\" AS TIME), 'HH12:MI AM') AS \"endTime\", m.\"roomId\" AS \"roomId\" FROM \"meeting\" \"m\""]);
  }
}
