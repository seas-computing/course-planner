import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNonClassParentArea1620366533405 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "areaId" uuid NOT NULL');
    await queryRunner.query('ALTER TABLE "non_class_parent" ALTER COLUMN "contactName" DROP NOT NULL');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD CONSTRAINT "FK_0442b6914faf272482b32d939ae" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone", "parent"."notes" AS "notes", "parent"."expectedSize" AS "expectedSize", "area"."name" AS "area" FROM "non_class_parent" "parent" LEFT JOIN "area" "area" ON "area"."id" = parent."areaId"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone", "parent"."notes" AS "notes", "parent"."expectedSize" AS "expectedSize", "area"."name" AS "area" FROM "non_class_parent" "parent" LEFT JOIN "area" "area" ON "area"."id" = parent."areaId"']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP CONSTRAINT "FK_0442b6914faf272482b32d939ae"');
    await queryRunner.query('ALTER TABLE "non_class_parent" ALTER COLUMN "contactName" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "areaId"');
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone", "parent"."notes" AS "notes", "parent"."expectedSize" AS "expectedSize" FROM "non_class_parent" "parent"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone", "parent"."notes" AS "notes", "parent"."expectedSize" AS "expectedSize" FROM "non_class_parent" "parent"']);
  }
}
