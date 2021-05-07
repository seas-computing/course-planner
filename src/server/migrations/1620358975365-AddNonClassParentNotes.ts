import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNonClassParentNotes1620358975365 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" ADD "notes" text');
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone", "parent"."notes" AS "notes" FROM "non_class_parent" "parent"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone", "parent"."notes" AS "notes" FROM "non_class_parent" "parent"']);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'NonClassParentView']);
    await queryRunner.query('DROP VIEW "NonClassParentView"');
    await queryRunner.query('ALTER TABLE "non_class_parent" DROP COLUMN "notes"');
    await queryRunner.query('CREATE VIEW "NonClassParentView" AS SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone" FROM "non_class_parent" "parent"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'NonClassParentView', 'SELECT "parent"."id" AS "id", "parent"."title" AS "title", "parent"."contactName" AS "contactName", "parent"."contactEmail" AS "contactEmail", "parent"."contactPhone" AS "contactPhone" FROM "non_class_parent" "parent"']);
  }
}
