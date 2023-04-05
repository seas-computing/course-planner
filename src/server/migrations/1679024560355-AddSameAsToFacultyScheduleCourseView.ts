import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration updates the FacultyScheduleCourseView to add a sameAs column.
 * The value, if it exists, would show the course's children if the course is a
 * parent, or it would show the course's parent and siblings, if any.
 */
export class AddSameAsToFacultyScheduleCourseView1679024560355
implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'FacultyScheduleCourseView']);
    await queryRunner.query('DROP VIEW "FacultyScheduleCourseView"');
    await queryRunner.query(`CREATE VIEW "FacultyScheduleCourseView" AS SELECT fci."courseInstanceId" AS "courseInstanceId", fci."facultyId" AS "facultyId", ci."semesterId" AS "semesterId", ci."courseId" AS "id", CONCAT_WS(' ', "c"."prefix", "c"."number") AS "catalogNumber", 
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
      END AS "sameAs" FROM "faculty_course_instances_course_instance" "fci" LEFT JOIN "course_instance" "ci" ON "ci"."id" = fci."courseInstanceId"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  LEFT JOIN "course" "parentCourse" ON "parentCourse"."id" = c."sameAsId"  LEFT JOIN "course" "childCourses" ON "childCourses"."sameAsId" = "c"."id"  LEFT JOIN "course" "siblingCourses" ON "siblingCourses"."sameAsId" = c."sameAsId" AND "siblingCourses".id <> "c"."id" GROUP BY fci."courseInstanceId", fci."facultyId", ci."semesterId", ci."courseId", "c"."prefix", "c"."number", c."sameAsId", "parentCourse".prefix, "parentCourse".number`);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'FacultyScheduleCourseView', "SELECT fci.\"courseInstanceId\" AS \"courseInstanceId\", fci.\"facultyId\" AS \"facultyId\", ci.\"semesterId\" AS \"semesterId\", ci.\"courseId\" AS \"id\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\", \n      CASE\n        -- 1. A course with children won't have a parent or siblings\n        WHEN count(\"childCourses\".id) > 0\n          THEN STRING_AGG(CONCAT_WS(' ', \"childCourses\".prefix, \"childCourses\".number), ', ')\n        -- 2. A course with siblings must have a parent AND cannot have children\n        WHEN count(\"siblingCourses\".id) > 0\n          THEN CONCAT_WS(\n            ', ',\n            CONCAT_WS(' ', \"parentCourse\".prefix, \"parentCourse\".number),\n            STRING_AGG(CONCAT_WS(' ', \"siblingCourses\".prefix, \"siblingCourses\".number), ', ')\n          )\n        -- 3. A course with a parent but no siblings cannot have children\n        WHEN c.\"sameAsId\" IS NOT NULL\n          THEN CONCAT_WS(' ', \"parentCourse\".prefix, \"parentCourse\".number)\n        -- 4. Default to empty string\n        ELSE ''\n      END AS \"sameAs\" FROM \"faculty_course_instances_course_instance\" \"fci\" LEFT JOIN \"course_instance\" \"ci\" ON \"ci\".\"id\" = fci.\"courseInstanceId\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  LEFT JOIN \"course\" \"parentCourse\" ON \"parentCourse\".\"id\" = c.\"sameAsId\"  LEFT JOIN \"course\" \"childCourses\" ON \"childCourses\".\"sameAsId\" = \"c\".\"id\"  LEFT JOIN \"course\" \"siblingCourses\" ON \"siblingCourses\".\"sameAsId\" = c.\"sameAsId\" AND \"siblingCourses\".id <> \"c\".\"id\" GROUP BY fci.\"courseInstanceId\", fci.\"facultyId\", ci.\"semesterId\", ci.\"courseId\", \"c\".\"prefix\", \"c\".\"number\", c.\"sameAsId\", \"parentCourse\".prefix, \"parentCourse\".number"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'FacultyScheduleCourseView']);
    await queryRunner.query('DROP VIEW "FacultyScheduleCourseView"');
    await queryRunner.query('CREATE VIEW "FacultyScheduleCourseView" AS SELECT fci."courseInstanceId" AS "courseInstanceId", fci."facultyId" AS "facultyId", ci."semesterId" AS "semesterId", ci."courseId" AS "id", CONCAT_WS(\' \', "c"."prefix", "c"."number") AS "catalogNumber" FROM "faculty_course_instances_course_instance" "fci" LEFT JOIN "course_instance" "ci" ON "ci"."id" = fci."courseInstanceId"  LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'FacultyScheduleCourseView', "SELECT fci.\"courseInstanceId\" AS \"courseInstanceId\", fci.\"facultyId\" AS \"facultyId\", ci.\"semesterId\" AS \"semesterId\", ci.\"courseId\" AS \"id\", CONCAT_WS(' ', \"c\".\"prefix\", \"c\".\"number\") AS \"catalogNumber\" FROM \"faculty_course_instances_course_instance\" \"fci\" LEFT JOIN \"course_instance\" \"ci\" ON \"ci\".\"id\" = fci.\"courseInstanceId\"  LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\""]);
  }
}
