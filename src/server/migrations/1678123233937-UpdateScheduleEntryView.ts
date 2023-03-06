import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This update to the ScheduleEntryView will update the results such that if a
 * course has a parent (this can be confirmed with the presence of a sameAs id),
 * the instances of the parent will be displayed instead.
 */
export class UpdateScheduleEntryView1678123233937
implements MigrationInterface {
  name = 'UpdateScheduleEntryView1678123233937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'ScheduleEntryView']);
    await queryRunner.query('DROP VIEW "ScheduleEntryView"');
    await queryRunner.query('CREATE VIEW "ScheduleEntryView" AS SELECT "ci"."id" AS "instanceId", "c"."number" AS "courseNumber", "c"."isUndergraduate" AS "isUndergraduate", "m"."id" AS "id", "campus"."name" AS "campus", CONCAT_WS(\' \', "b"."name", "r"."name") AS "room", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "blockId" FROM "course_instance" "ci" LEFT JOIN "course" "c" ON "c"."id" = COALESCE(c."sameAsId", ci."courseId")  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "building" "b" ON "b"."id" = r."buildingId"  LEFT JOIN "campus" "campus" ON "campus"."id" = b."campusId" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleEntryView', "SELECT \"ci\".\"id\" AS \"instanceId\", \"c\".\"number\" AS \"courseNumber\", \"c\".\"isUndergraduate\" AS \"isUndergraduate\", \"m\".\"id\" AS \"id\", \"campus\".\"name\" AS \"campus\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"room\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"blockId\" FROM \"course_instance\" \"ci\" LEFT JOIN \"course\" \"c\" ON \"c\".\"id\" = COALESCE(c.\"sameAsId\", ci.\"courseId\")  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"building\" \"b\" ON \"b\".\"id\" = r.\"buildingId\"  LEFT JOIN \"campus\" \"campus\" ON \"campus\".\"id\" = b.\"campusId\" WHERE c.\"isSEAS\" <> 'N'"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "schema" = $2 AND "name" = $3', ['VIEW', 'public', 'ScheduleEntryView']);
    await queryRunner.query('DROP VIEW "ScheduleEntryView"');
    await queryRunner.query('CREATE VIEW "ScheduleEntryView" AS SELECT "ci"."id" AS "instanceId", "c"."number" AS "courseNumber", "c"."isUndergraduate" AS "isUndergraduate", "m"."id" AS "id", "campus"."name" AS "campus", CONCAT_WS(\' \', "b"."name", "r"."name") AS "room", CONCAT("c"."prefix", "m"."day", TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), "s"."term", s."academicYear") AS "blockId" FROM "course_instance" "ci" LEFT JOIN "course" "c" ON ci."courseId" = "c"."id"  INNER JOIN "semester" "s" ON "s"."id" = ci."semesterId"  INNER JOIN "meeting" "m" ON m."courseInstanceId" = "ci"."id"  LEFT JOIN "room" "r" ON "r"."id" = m."roomId"  LEFT JOIN "building" "b" ON "b"."id" = r."buildingId"  LEFT JOIN "campus" "campus" ON "campus"."id" = b."campusId" WHERE c."isSEAS" <> \'N\'');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'ScheduleEntryView', "SELECT \"ci\".\"id\" AS \"instanceId\", \"c\".\"number\" AS \"courseNumber\", \"c\".\"isUndergraduate\" AS \"isUndergraduate\", \"m\".\"id\" AS \"id\", \"campus\".\"name\" AS \"campus\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"room\", CONCAT(\"c\".\"prefix\", \"m\".\"day\", TO_CHAR(m.\"startTime\"::TIME, 'HH24MI'), TO_CHAR(m.\"endTime\"::TIME, 'HH24MI'), \"s\".\"term\", s.\"academicYear\") AS \"blockId\" FROM \"course_instance\" \"ci\" LEFT JOIN \"course\" \"c\" ON ci.\"courseId\" = \"c\".\"id\"  INNER JOIN \"semester\" \"s\" ON \"s\".\"id\" = ci.\"semesterId\"  INNER JOIN \"meeting\" \"m\" ON m.\"courseInstanceId\" = \"ci\".\"id\"  LEFT JOIN \"room\" \"r\" ON \"r\".\"id\" = m.\"roomId\"  LEFT JOIN \"building\" \"b\" ON \"b\".\"id\" = r.\"buildingId\"  LEFT JOIN \"campus\" \"campus\" ON \"campus\".\"id\" = b.\"campusId\" WHERE c.\"isSEAS\" <> 'N'"]);
  }
}
