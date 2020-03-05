import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `NOT NULL` constraint to [[Course]] entity and `course` table to enforce
 * the specification of an area when creating a course. This is because it
 * does not make sense to allow courses to be created with no area attached
 */
export class RequireCourseAreaId1582741033740 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" DROP CONSTRAINT "FK_d43d51e738645bda6c1afca405b"', undefined);
    await queryRunner.query('ALTER TABLE "course" ALTER COLUMN "areaId" SET NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE "course" ADD CONSTRAINT "FK_d43d51e738645bda6c1afca405b" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" DROP CONSTRAINT "FK_d43d51e738645bda6c1afca405b"', undefined);
    await queryRunner.query('ALTER TABLE "course" ALTER COLUMN "areaId" DROP NOT NULL', undefined);
    await queryRunner.query('ALTER TABLE "course" ADD CONSTRAINT "FK_d43d51e738645bda6c1afca405b" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION', undefined);
  }
}
