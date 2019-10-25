import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The original implementation ([[FacultyTable1561005425013]]) of the Faculty
 * table allowed the `category` column to contain either `LADDER` or NON_LADDER`
 * as contained in [[FACULTY_TYPE]].
 *
 * This migration revises this slightly to also allow
 * [[FACULTY_TYPE.NON_SEAS_LADDER]]. Non-SEAS ladder faculty, are faculty
 * members who are ladder faculty but who work outside of SEAS(for example
 * a professor from FAS)
 */
export class AddFacultyStatus1572018363202 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TYPE "public"."faculty_category_enum" RENAME TO "faculty_category_enum_old"');
    await queryRunner.query('CREATE TYPE "faculty_category_enum" AS ENUM(\'LADDER\', \'NON_LADDER\', \'NON_SEAS_LADDER\')');
    await queryRunner.query('ALTER TABLE "faculty" ALTER COLUMN "category" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "faculty" ALTER COLUMN "category" TYPE "faculty_category_enum" USING "category"::"text"::"faculty_category_enum"');
    await queryRunner.query('DROP TYPE "faculty_category_enum_old"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "faculty_category_enum_old" AS ENUM(\'LADDER\', \'NON_LADDER\')');
    await queryRunner.query('ALTER TABLE "faculty" ALTER COLUMN "category" DROP DEFAULT');
    await queryRunner.query('ALTER TABLE "faculty" ALTER COLUMN "category" TYPE "faculty_category_enum_old" USING "category"::"text"::"faculty_category_enum_old"');
    await queryRunner.query('ALTER TABLE "faculty" ALTER COLUMN "category" SET DEFAULT \'NON_LADDER\'');
    await queryRunner.query('DROP TYPE "faculty_category_enum"');
    await queryRunner.query('ALTER TYPE "faculty_category_enum_old" RENAME TO  "faculty_category_enum"');
  }
}
