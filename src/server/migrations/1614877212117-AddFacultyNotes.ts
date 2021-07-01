import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Updates the FacultyListingView to include faculty notes field.
 */
export class AddFacultyNotes1614877212117 implements MigrationInterface {
  name = 'AddFacultyNotes1614877212117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'FacultyListingView']);
    await queryRunner.query('DROP VIEW "FacultyListingView"');
    await queryRunner.query('CREATE VIEW "FacultyListingView" AS SELECT "f"."id" AS "id", "f"."notes" AS "notes", "fci"."order" AS "instructorOrder", CONCAT_WS(\', \', f."lastName", f."firstName") AS "displayName", fci."courseInstanceId" AS "courseInstanceId" FROM "faculty" "f" LEFT JOIN "faculty_course_instances_course_instance" "fci" ON fci."facultyId" = "f"."id"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'FacultyListingView', "SELECT \"f\".\"id\" AS \"id\", \"f\".\"notes\" AS \"notes\", \"fci\".\"order\" AS \"instructorOrder\", CONCAT_WS(', ', f.\"lastName\", f.\"firstName\") AS \"displayName\", fci.\"courseInstanceId\" AS \"courseInstanceId\" FROM \"faculty\" \"f\" LEFT JOIN \"faculty_course_instances_course_instance\" \"fci\" ON fci.\"facultyId\" = \"f\".\"id\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'FacultyListingView']);
    await queryRunner.query('DROP VIEW "FacultyListingView"');
    await queryRunner.query('CREATE VIEW "FacultyListingView" AS SELECT "f"."id" AS "id", "fci"."order" AS "instructorOrder", CONCAT_WS(\', \', f."lastName", f."firstName") AS "displayName", fci."courseInstanceId" AS "courseInstanceId" FROM "faculty" "f" LEFT JOIN "faculty_course_instances_course_instance" "fci" ON fci."facultyId" = "f"."id"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'FacultyListingView', "SELECT \"f\".\"id\" AS \"id\", \"fci\".\"order\" AS \"instructorOrder\", CONCAT_WS(', ', f.\"lastName\", f.\"firstName\") AS \"displayName\", fci.\"courseInstanceId\" AS \"courseInstanceId\" FROM \"faculty\" \"f\" LEFT JOIN \"faculty_course_instances_course_instance\" \"fci\" ON fci.\"facultyId\" = \"f\".\"id\""]);
  }
}
