import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The original DTO for the [[CourseInstanceResponse]] Did not include the
 * name of the campus on which the building is located. Since this data is
 * needed in the design prototypes, we're adding it to the RoomListingView
 * entity definition here.
 */

export class AddCampusToRoomListingView1590082567048
implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomListingView']);
    await queryRunner.query('DROP VIEW "RoomListingView"', undefined);
    await queryRunner.query('CREATE VIEW "RoomListingView" AS SELECT "r"."id" AS "id", "c"."name" AS "campus", CONCAT_WS(\' \', "b"."name", "r"."name") AS "name" FROM "room" "r" LEFT JOIN "building" "b" ON r."buildingId" = "b"."id"  LEFT JOIN "campus" "c" ON b."campusId" = "c"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomListingView', "SELECT \"r\".\"id\" AS \"id\", \"c\".\"name\" AS \"campus\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"name\" FROM \"room\" \"r\" LEFT JOIN \"building\" \"b\" ON r.\"buildingId\" = \"b\".\"id\"  LEFT JOIN \"campus\" \"c\" ON b.\"campusId\" = \"c\".\"id\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomListingView']);
    await queryRunner.query('DROP VIEW "RoomListingView"', undefined);
    await queryRunner.query('CREATE VIEW "RoomListingView" AS SELECT "r"."id" AS "id", CONCAT_WS(\' \', "b"."name", "r"."name") AS "name" FROM "room" "r" LEFT JOIN "building" "b" ON r."buildingId" = "b"."id"', undefined);
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomListingView', "SELECT \"r\".\"id\" AS \"id\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"name\" FROM \"room\" \"r\" LEFT JOIN \"building\" \"b\" ON r.\"buildingId\" = \"b\".\"id\""]);
  }
}
