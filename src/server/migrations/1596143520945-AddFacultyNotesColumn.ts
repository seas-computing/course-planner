import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration adds a 'Notes' column to the Faculty entity.
 * The notes will contain additional information specific to the faculty member.
*/
export class AddFacultyNotesColumn1596143520945 implements MigrationInterface {
    name = 'AddFacultyNotesColumn1596143520945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faculty" ADD "notes" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faculty" DROP COLUMN "notes"`);
    }

}
