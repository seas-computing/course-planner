import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initially, the isSEAS value on a course was set up to be a simple boolean
 * value. However, a deeper examination of the existing application revealed
 * that there are actually three possible values for the isSEAS field, so it
 * needs to be changed to an enum value instead.
 *
 * NOTE: This migration had to be stitched together because TypeORM wasn't
 * handling the propagation of the change in the isSEAS column to the
 * CourseListingView, so I needed to add code to drop and re-create the view
 * in order to let the migration run correctly.
 */

export class MakeIsSEASAnEnum1590696474204 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'CourseListingView']);
    await queryRunner.query('DROP VIEW "CourseListingView"', undefined);
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "isSEAS"', undefined);
    await queryRunner.query('CREATE TYPE "course_isseas_enum" AS ENUM(\'Y\', \'N\', \'EPS\')', undefined);
    await queryRunner.query('ALTER TABLE "course" ADD "isSEAS" "course_isseas_enum" NOT NULL DEFAULT \'Y\'', undefined);
    await queryRunner.query('CREATE VIEW "CourseListingView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "c"."notes" AS "notes", "a"."name" AS "area", c."isUndergraduate" AS "isUndergraduate", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."sameAs" AS "sameAs", c."isSEAS" AS "isSEAS", c."termPattern" AS "termPattern" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'CourseListingView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"c\".\"notes\" AS \"notes\", \"a\".\"name\" AS \"area\", c.\"isUndergraduate\" AS \"isUndergraduate\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"sameAs\" AS \"sameAs\", c.\"isSEAS\" AS \"isSEAS\", c.\"termPattern\" AS \"termPattern\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'CourseListingView']);
    await queryRunner.query('DROP VIEW "CourseListingView"', undefined);
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "isSEAS"', undefined);
    await queryRunner.query('DROP TYPE "course_isseas_enum"', undefined);
    await queryRunner.query('ALTER TABLE "course" ADD "isSEAS" boolean NOT NULL DEFAULT true', undefined);
    await queryRunner.query('CREATE VIEW "CourseListingView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "c"."notes" AS "notes", "a"."name" AS "area", c."isUndergraduate" AS "isUndergraduate", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."sameAs" AS "sameAs", c."isSEAS" AS "isSEAS", c."termPattern" AS "termPattern" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'CourseListingView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"c\".\"notes\" AS \"notes\", \"a\".\"name\" AS \"area\", c.\"isUndergraduate\" AS \"isUndergraduate\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"sameAs\" AS \"sameAs\", c.\"isSEAS\" AS \"isSEAS\", c.\"termPattern\" AS \"termPattern\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\""]);
  }
}
