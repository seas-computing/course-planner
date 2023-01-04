import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This will replace the existing sameAs field to act as a self-referential
 * foreign key, implementing a parent-child relationship between two courses to
 * indicate the that the "child" is the same course as the "parent." The bigger
 * change is in the courseListingView, where the sameAs field is derived from
 * the related courses.
 */

export class SameAsRelationship1670985330940 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'CourseListingView']);
    await queryRunner.query('DROP VIEW "CourseListingView"');
    await queryRunner.query('ALTER TABLE "course" RENAME COLUMN "sameAs" TO "sameAsId"');
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "sameAsId"');
    await queryRunner.query('ALTER TABLE "course" ADD "sameAsId" uuid');
    await queryRunner.query('ALTER TABLE "course" ADD CONSTRAINT "FK_3618faf801d72b75ef32a9f7ca7" FOREIGN KEY ("sameAsId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query(`CREATE VIEW "CourseListingView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "c"."notes" AS "notes", "a"."name" AS "area", c."isUndergraduate" AS "isUndergraduate", CONCAT_WS(' ', "c"."prefix", "c"."number") AS "catalogNumber", ARRAY_AGG(CONCAT_WS(' ', "childCourses".prefix, "childCourses".number)) AS "childCourseNumbers", 
      CASE
        -- 1. A course with children won't have a parent or siblings
        WHEN count("childCourses".id) > 0
          THEN STRING_AGG(CONCAT_WS(' ', "childCourses".prefix, "childCourses".number), ', ')
        -- 2. A course with siblings must have a parent AND cannot have children
        WHEN count("siblingCourses".id) > 0
          THEN CONCAT_WS(
            ', ',
            CONCAT_WS(' ', "parentCourse".prefix, "parentCourse".number),
            STRING_AGG(CONCAT_WS(' ', "siblingCourses".prefix, "siblingCourses".number), ', ')
          )
        -- 3. A course with a parent but no siblings cannot have children
        WHEN c."sameAsId" IS NOT NULL
          THEN CONCAT_WS(' ', "parentCourse".prefix, "parentCourse".number)
        -- 4. Default to empty string
        ELSE ''
      END AS "sameAs", c."isSEAS" AS "isSEAS", c."termPattern" AS "termPattern", c."sameAsId" AS "sameAsId" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"  LEFT JOIN "course" "parentCourse" ON "parentCourse"."id" = c."sameAsId"  LEFT JOIN "course" "childCourses" ON "childCourses"."sameAsId" = "c"."id"  LEFT JOIN "course" "siblingCourses" ON "siblingCourses"."sameAsId" = c."sameAsId" AND "siblingCourses".id <> "c"."id" GROUP BY "c"."id", "c"."title", "a"."name", "parentCourse".prefix, "parentCourse".number`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'CourseListingView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"c\".\"notes\" AS \"notes\", \"a\".\"name\" AS \"area\", c.\"isUndergraduate\" AS \"isUndergraduate\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", ARRAY_AGG(CONCAT_WS(' ', \"childCourses\".prefix, \"childCourses\".number)) AS \"childCourseNumbers\", \n      CASE\n        -- 1. A course with children won't have a parent or siblings\n        WHEN count(\"childCourses\".id) > 0\n          THEN STRING_AGG(CONCAT_WS(' ', \"childCourses\".prefix, \"childCourses\".number), ', ')\n        -- 2. A course with siblings must have a parent AND cannot have children\n        WHEN count(\"siblingCourses\".id) > 0\n          THEN CONCAT_WS(\n            ', ',\n            CONCAT_WS(' ', \"parentCourse\".prefix, \"parentCourse\".number),\n            STRING_AGG(CONCAT_WS(' ', \"siblingCourses\".prefix, \"siblingCourses\".number), ', ')\n          )\n        -- 3. A course with a parent but no siblings cannot have children\n        WHEN c.\"sameAsId\" IS NOT NULL\n          THEN CONCAT_WS(' ', \"parentCourse\".prefix, \"parentCourse\".number)\n        -- 4. Default to empty string\n        ELSE ''\n      END AS \"sameAs\", c.\"isSEAS\" AS \"isSEAS\", c.\"termPattern\" AS \"termPattern\", c.\"sameAsId\" AS \"sameAsId\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\"  LEFT JOIN \"course\" \"parentCourse\" ON \"parentCourse\".\"id\" = c.\"sameAsId\"  LEFT JOIN \"course\" \"childCourses\" ON \"childCourses\".\"sameAsId\" = \"c\".\"id\"  LEFT JOIN \"course\" \"siblingCourses\" ON \"siblingCourses\".\"sameAsId\" = c.\"sameAsId\" AND \"siblingCourses\".id <> \"c\".\"id\" GROUP BY \"c\".\"id\", \"c\".\"title\", \"a\".\"name\", \"parentCourse\".prefix, \"parentCourse\".number"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'CourseListingView']);
    await queryRunner.query('DROP VIEW "CourseListingView"');
    await queryRunner.query('ALTER TABLE "course" DROP CONSTRAINT "FK_3618faf801d72b75ef32a9f7ca7"');
    await queryRunner.query('ALTER TABLE "course" DROP COLUMN "sameAsId"');
    await queryRunner.query('ALTER TABLE "course" ADD "sameAsId" text NOT NULL DEFAULT \'\'');
    await queryRunner.query('ALTER TABLE "course" RENAME COLUMN "sameAsId" TO "sameAs"');
    await queryRunner.query('CREATE VIEW "CourseListingView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "c"."notes" AS "notes", "a"."name" AS "area", c."isUndergraduate" AS "isUndergraduate", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."sameAs" AS "sameAs", c."isSEAS" AS "isSEAS", c."termPattern" AS "termPattern" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'CourseListingView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"c\".\"notes\" AS \"notes\", \"a\".\"name\" AS \"area\", c.\"isUndergraduate\" AS \"isUndergraduate\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"sameAs\" AS \"sameAs\", c.\"isSEAS\" AS \"isSEAS\", c.\"termPattern\" AS \"termPattern\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\""]);
  }
}
