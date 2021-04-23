import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration replaces the ScheduleEntryView created in
 * 1603825601596-ScheduleViews.ts to remove the relation between the
 * ScheduleEntryView and the MeetingListingView and RoomListingView, which was
 * creating a dependency in the view definition and making it impossible to
 * update the MeetingListingView in 1618340375982-NonClassEventViews.ts.
 * Becuase that dependency breaks the migration:run process, the timestamp on
 * this migration has been modified so that it will run BEFORE the
 * NonClassEventViews migration.
 *
 * At a deeper level, the issue here is that TypeORM handles any changes to
 * Views by dropping and recreating the view, rather than altering them in
 * place. Since Views don't contain any actual data this doesn't result in any
 * data loss, but it does make it much harder to handle relations among views.
 */

export class RemoveViewDependencies1618340375981 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'ScheduleEntryView']);
    await queryRunner.query('DROP VIEW "ScheduleEntryView"');
    await queryRunner.query('CREATE VIEW "ScheduleEntryView" AS SELECT "c"."number" AS "courseNumber", "c"."isUndergraduate" AS "isUndergraduate", "m"."id" AS "id", "campus"."name" AS "campus", CONCAT_WS(\' \', "b"."name", "r"."name") AS "room", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "blockId" FROM "course_instance" "ci" LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "building" "b" ON "b"."id" = r."buildingId"  LEFT JOIN "campus" "campus" ON "campus"."id" = b."campusId" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleEntryView', "SELECT \"c\".\"number\" AS \"courseNumber\", \"c\".\"isUndergraduate\" AS \"isUndergraduate\", \"m\".\"id\" AS \"id\", \"campus\".\"name\" AS \"campus\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"room\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"blockId\" FROM \"course_instance\" \"ci\" LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"building\" \"b\" ON \"b\".\"id\" = r.\"buildingId\"  LEFT JOIN \"campus\" \"campus\" ON \"campus\".\"id\" = b.\"campusId\" WHERE c.\"isSEAS\" <> 'N'"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'ScheduleEntryView']);
    await queryRunner.query('DROP VIEW "ScheduleEntryView"');
    await queryRunner.query('CREATE VIEW "ScheduleEntryView" AS SELECT "c"."number" AS "courseNumber", "c"."isUndergraduate" AS "isUndergraduate", "m"."id" AS "id", "r"."name" AS "room", "r"."campus" AS "campus", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "blockId" FROM "course_instance" "ci" LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "MeetingListingView" "m" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "RoomListingView" "r" ON "r"."id" = m."roomId" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleEntryView', "SELECT \"c\".\"number\" AS \"courseNumber\", \"c\".\"isUndergraduate\" AS \"isUndergraduate\", \"m\".\"id\" AS \"id\", \"r\".\"name\" AS \"room\", \"r\".\"campus\" AS \"campus\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"blockId\" FROM \"course_instance\" \"ci\" LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"MeetingListingView\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"RoomListingView\" \"r\" ON \"r\".\"id\" = m.\"roomId\" WHERE c.\"isSEAS\" <> 'N'"]);
  }
}
