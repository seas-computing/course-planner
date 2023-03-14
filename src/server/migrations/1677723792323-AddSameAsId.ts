import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This will add the sameAsId field to the MultiYearPlanView so that we can
 * use the field value to reference the parent, if it exists, of the course.
 */
export class AddSameAsId1677723792323 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'MultiYearPlanView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanView"');
    await queryRunner.query('CREATE VIEW "MultiYearPlanView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "c"."prefix" AS "catalogPrefix", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber", c."sameAsId" AS "sameAsId" FROM "course" "c" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"c\".\"prefix\" AS \"catalogPrefix\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", c.\"sameAsId\" AS \"sameAsId\" FROM \"course\" \"c\" WHERE c.\"isSEAS\" <> 'N'"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'MultiYearPlanView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanView"');
    await queryRunner.query('CREATE VIEW "MultiYearPlanView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "c"."prefix" AS "catalogPrefix", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber" FROM "course" "c" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"c\".\"prefix\" AS \"catalogPrefix\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\" FROM \"course\" \"c\" WHERE c.\"isSEAS\" <> 'N'"]);
  }
}
