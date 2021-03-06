import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiYearPlanView1601574519485 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MultiYearPlanView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanView"');
    await queryRunner.query('CREATE VIEW "MultiYearPlanView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "c"."prefix" AS "catalogPrefix", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber" FROM "course" "c" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"c\".\"prefix\" AS \"catalogPrefix\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\" FROM \"course\" \"c\" WHERE c.\"isSEAS\" <> 'N'"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'MultiYearPlanView']);
    await queryRunner.query('DROP VIEW "MultiYearPlanView"');
    await queryRunner.query('CREATE VIEW "MultiYearPlanView" AS SELECT "c"."id" AS "id", "c"."title" AS "title", "a"."name" AS "area", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber" FROM "course" "c" LEFT JOIN "area" "a" ON c."areaId" = "a"."id"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'MultiYearPlanView', "SELECT \"c\".\"id\" AS \"id\", \"c\".\"title\" AS \"title\", \"a\".\"name\" AS \"area\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\" FROM \"course\" \"c\" LEFT JOIN \"area\" \"a\" ON c.\"areaId\" = \"a\".\"id\""]);
  }
}
