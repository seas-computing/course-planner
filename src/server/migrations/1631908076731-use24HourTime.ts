import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Originally, our plan was to let Postgres handle the conversion between 12- and 24-hour time formats. However, as we got further into development this proved to be a problematic decision, as the HTML input elements we're using to modify/create times handle the data in 24-hour, which was leading to a singnificant amount of conversion between the two formats. This in turn was creating bugs when we needed to compare times for validation, as we could unintentionally end up comparing the two formats, which will fail half the time.
 *
 * Thus, we're removing the conversion to 12-hour time defined in this view, and instead we'll keep all times in 24-hour time wherever they're being used as data, and will only format them in 12-hour time when they're being displayed for user consumption.
 */

export class use24HourTime1631908076731 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"');
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", m."nonClassEventId" AS "nonClassEventId", m."startTime" AS "startTime", m."endTime" AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', 'SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", m."nonClassEventId" AS "nonClassEventId", m."startTime" AS "startTime", m."endTime" AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'MeetingListingView']);
    await queryRunner.query('DROP VIEW "MeetingListingView"');
    await queryRunner.query('CREATE VIEW "MeetingListingView" AS SELECT "m"."id" AS "id", "m"."day" AS "day", m."courseInstanceId" AS "courseInstanceId", m."nonClassEventId" AS "nonClassEventId", TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\') AS "startTime", TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\') AS "endTime", m."roomId" AS "roomId" FROM "meeting" "m"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MeetingListingView', "SELECT \"m\".\"id\" AS \"id\", \"m\".\"day\" AS \"day\", m.\"courseInstanceId\" AS \"courseInstanceId\", m.\"nonClassEventId\" AS \"nonClassEventId\", TO_CHAR(CAST (m.\"startTime\" AS TIME), 'HH12:MI AM') AS \"startTime\", TO_CHAR(CAST (m.\"endTime\" AS TIME), 'HH12:MI AM') AS \"endTime\", m.\"roomId\" AS \"roomId\" FROM \"meeting\" \"m\""]);
  }
}
