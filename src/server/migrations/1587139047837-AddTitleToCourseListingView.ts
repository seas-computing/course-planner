import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Amends the CourseListingView created in 1583524438353-CourseListingViews to
 * include the title of the course. This was specified in the
 * CourseInstanceResponseDTO, but was erroneously left out of the original
 * View Entity definition.
 */

export class AddTitleToCourseListingView1587139047837
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'CourseListingView']);
    await queryRunner.query('DROP VIEW "CourseListingView"', undefined);
    await queryRunner.query('CREATE VIEW "CourseListingView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "c"."notes" AS "notes", "a"."name" AS "area", c."isUndergraduate" AS "isUndergraduate", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."sameAs" AS "sameAs", c."isSEAS" AS "isSEAS", c."termPattern" AS "termPattern" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'CourseListingView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"c\".\"notes\" AS \"notes\", \"a\".\"name\" AS \"area\", c.\"isUndergraduate\" AS \"isUndergraduate\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"sameAs\" AS \"sameAs\", c.\"isSEAS\" AS \"isSEAS\", c.\"termPattern\" AS \"termPattern\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'CourseListingView']);
    await queryRunner.query('DROP VIEW "CourseListingView"', undefined);
    await queryRunner.query('CREATE VIEW "CourseListingView" AS SELECT "c"."id" AS "id", "c"."notes" AS "notes", "a"."name" AS "area", c."isUndergraduate" AS "isUndergraduate", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."sameAs" AS "sameAs", c."isSEAS" AS "isSEAS", c."termPattern" AS "termPattern" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'CourseListingView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"notes\" AS \"notes\", \"a\".\"name\" AS \"area\", c.\"isUndergraduate\" AS \"isUndergraduate\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"sameAs\" AS \"sameAs\", c.\"isSEAS\" AS \"isSEAS\", c.\"termPattern\" AS \"termPattern\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\""]);
  }
}
