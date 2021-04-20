import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the capacity property to the RoomListingView for the purpose of
 * including capacity in the Room GET request response, which uses the
 * RoomListingView to retrieve room data.
 */
export class AddRoomCapacity1618886074206 implements MigrationInterface {
  name = 'AddRoomCapacity1618886074206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomListingView']);
    await queryRunner.query('DROP VIEW "RoomListingView"');
    await queryRunner.query('CREATE VIEW "RoomListingView" AS SELECT "r"."id" AS "id", "r"."capacity" AS "capacity", "c"."name" AS "campus", CONCAT_WS(\' \', "b"."name", "r"."name") AS "name" FROM "room" "r" LEFT JOIN "building" "b" ON r."buildingId" = "b"."id"  LEFT JOIN "campus" "c" ON b."campusId" = "c"."id"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomListingView', "SELECT \"r\".\"id\" AS \"id\", \"r\".\"capacity\" AS \"capacity\", \"c\".\"name\" AS \"campus\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"name\" FROM \"room\" \"r\" LEFT JOIN \"building\" \"b\" ON r.\"buildingId\" = \"b\".\"id\"  LEFT JOIN \"campus\" \"c\" ON b.\"campusId\" = \"c\".\"id\""]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "typeorm_metadata" WHERE "type" = \'VIEW\' AND "schema" = $1 AND "name" = $2', ['public', 'RoomListingView']);
    await queryRunner.query('DROP VIEW "RoomListingView"');
    await queryRunner.query('CREATE VIEW "RoomListingView" AS SELECT "r"."id" AS "id", "c"."name" AS "campus", CONCAT_WS(\' \', "b"."name", "r"."name") AS "name" FROM "room" "r" LEFT JOIN "building" "b" ON r."buildingId" = "b"."id"  LEFT JOIN "campus" "c" ON b."campusId" = "c"."id"');
    await queryRunner.query('INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)', ['VIEW', 'public', 'RoomListingView', "SELECT \"r\".\"id\" AS \"id\", \"c\".\"name\" AS \"campus\", CONCAT_WS(' ', \"b\".\"name\", \"r\".\"name\") AS \"name\" FROM \"room\" \"r\" LEFT JOIN \"building\" \"b\" ON r.\"buildingId\" = \"b\".\"id\"  LEFT JOIN \"campus\" \"c\" ON b.\"campusId\" = \"c\".\"id\""]);
  }
}
