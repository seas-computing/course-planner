import { MigrationInterface, QueryRunner } from 'typeorm';

export class MeetingTable1561405786742 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TYPE "meeting_day_enum" AS ENUM(\'Mon\', \'Tue\', \'Wed\', \'Thu\', \'Fri\')');
    await queryRunner.query('CREATE TABLE "meeting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "start" TIME WITH TIME ZONE NOT NULL, "end" TIME WITH TIME ZONE NOT NULL, "day" "meeting_day_enum" NOT NULL, "nonClassEventId" uuid, "courseInstanceId" uuid, CONSTRAINT "PK_dccaf9e4c0e39067d82ccc7bb83" PRIMARY KEY ("id"))');
    await queryRunner.query('ALTER TABLE "meeting" ADD CONSTRAINT "FK_e8b891d69d67415f07e89b962d6" FOREIGN KEY ("nonClassEventId") REFERENCES "non_class_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "meeting" ADD CONSTRAINT "FK_d0e48a5a21dcdfbeeddce94f313" FOREIGN KEY ("courseInstanceId") REFERENCES "course_instance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "meeting" DROP CONSTRAINT "FK_d0e48a5a21dcdfbeeddce94f313"');
    await queryRunner.query('ALTER TABLE "meeting" DROP CONSTRAINT "FK_e8b891d69d67415f07e89b962d6"');
    await queryRunner.query('DROP TABLE "meeting"');
    await queryRunner.query('DROP TYPE "meeting_day_enum"');
  }
}
