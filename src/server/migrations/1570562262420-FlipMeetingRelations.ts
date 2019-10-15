import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The schema for `meeting` introduced in [[MeetingTable1561405786742]] was
 * implemented with entity ownership the wrong way round, meaning that one room
 * had the meeting ID recorded against it, rather than a meeting having the
 * meeting with the room ID recorded against it
 */
export class FlipMeetingRelations1570562262420 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "room" DROP CONSTRAINT "FK_b06efa750185fad4fa01ee732c8"');
    await queryRunner.query('ALTER TABLE "room" DROP COLUMN "meetingsId"');
    await queryRunner.query('ALTER TABLE "meeting" ADD "roomId" uuid');
    await queryRunner.query('ALTER TABLE "meeting" ADD CONSTRAINT "FK_37887d9f082c3542df850e11d41" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "meeting" DROP CONSTRAINT "FK_37887d9f082c3542df850e11d41"');
    await queryRunner.query('ALTER TABLE "meeting" DROP COLUMN "roomId"');
    await queryRunner.query('ALTER TABLE "room" ADD "meetingsId" uuid');
    await queryRunner.query('ALTER TABLE "room" ADD CONSTRAINT "FK_b06efa750185fad4fa01ee732c8" FOREIGN KEY ("meetingsId") REFERENCES "meeting"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }
}
