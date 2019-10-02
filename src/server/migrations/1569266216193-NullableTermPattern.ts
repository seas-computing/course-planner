import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The original implementation of the `course` table introduced in
 * [[CourseTable1560956281223]] did not allow `NULL` values for the termPattern
 * field. However, some data currently in the legacy system has `NULL` for this
 * field (presumably in instances where that information is still TBD), so it
 * was necessary to relax the restriction on this field to account for this
 */
export class NullableTermPattern1569266216193 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" ALTER COLUMN "termPattern" DROP NOT NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "course" ALTER COLUMN "termPattern" SET NOT NULL');
  }
}
