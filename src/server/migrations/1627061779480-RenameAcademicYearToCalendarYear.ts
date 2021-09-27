import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration renames the `academicYear` property of the NonClassEventView to
 * `calendarYear` since that's the data that's actually being stored in the
 * underlying table.
 *
 * Ticket #193 exists in the backlog to straighten this out accross the
 * application, but for now this has jsut been fixed for this view
 */
export class RenameAcademicYearToCalendarYear1627061779480
implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'NonClassEventView']);
    await queryRunner.query('DROP VIEW "NonClassEventView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" ALTER COLUMN "contactName" DROP NOT NULL');
    await queryRunner.query('CREATE VIEW "NonClassEventView" AS SELECT "event"."id" AS "id", "s"."term" AS "term", event."nonClassParentId" AS "nonClassParentId", s."calendarYear" AS "calendarYear", event."semesterId" AS "semesterId" FROM "non_class_event" "event" LEFT JOIN "SemesterView" "s" ON "s"."id" = event."semesterId"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassEventView', 'SELECT "event"."id" AS "id", "s"."term" AS "term", event."nonClassParentId" AS "nonClassParentId", s."calendarYear" AS "calendarYear", event."semesterId" AS "semesterId" FROM "non_class_event" "event" LEFT JOIN "SemesterView" "s" ON "s"."id" = event."semesterId"']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'NonClassEventView']);
    await queryRunner.query('DROP VIEW "NonClassEventView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" ALTER COLUMN "contactName" SET NOT NULL');
    await queryRunner.query(`CREATE VIEW "NonClassEventView" AS SELECT "event"."id" AS "id", "s"."term" AS "term", event."nonClassParentId" AS "nonClassParentId", CASE
        WHEN term = 'FALL' THEN "s"."academicYear" + 1
        ELSE "s"."academicYear"
      END AS "academicYear", event."semesterId" AS "semesterId" FROM "non_class_event" "event" LEFT JOIN "semester" "s" ON "s"."id" = event."semesterId"`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassEventView', "SELECT \"event\".\"id\" AS \"id\", \"s\".\"term\" AS \"term\", event.\"nonClassParentId\" AS \"nonClassParentId\", CASE\n        WHEN term = 'FALL' THEN \"s\".\"academicYear\" + 1\n        ELSE \"s\".\"academicYear\"\n      END AS \"academicYear\", event.\"semesterId\" AS \"semesterId\" FROM \"non_class_event\" \"event\" LEFT JOIN \"semester\" \"s\" ON \"s\".\"id\" = event.\"semesterId\""]);
  }
}
