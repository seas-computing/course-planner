import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * An update to TypeORM has begun adding column comments in migrations. This
 * adds a lot of noise in unrelated migrations, so we're adding this in a
 * one-off migration instead.
 */

export class AddDatabaseComments1622033603597 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('COMMENT ON COLUMN "faculty"."jointWith" IS \'Affiliations to other schools this faculty member may have outside of SEAS\'');
    await queryRunner.query('COMMENT ON COLUMN "faculty"."notes" IS \'Notes specific to the faculty member outlining preferences and additional information\'');
    await queryRunner.query('COMMENT ON COLUMN "area"."name" IS \'The subject area name (i.e - Applied Mathematics)\'');
    await queryRunner.query('COMMENT ON COLUMN "course"."title" IS \'The long title for the course (i.e - Introduction to computer science)\'');
    await queryRunner.query('COMMENT ON COLUMN "course"."prefix" IS \'The alphabetical part of the course code (i.e - The CS in CS 50) that denotes the subject. In this case "CS refers to "Computer Science"\'');
    await queryRunner.query('COMMENT ON COLUMN "course"."number" IS \'The numerical part of the course code (i.e - the CS in CS 50). May also include an alphabetical component (i.e - CS 109b)\'');
    await queryRunner.query('COMMENT ON COLUMN "course"."notes" IS \'Free text for administrators to record notes against a course\'');
    await queryRunner.query('COMMENT ON COLUMN "course"."private" IS \'Allows admin staff to hide courses and prevent their publication either because the courses are non-SEAS courses and should not be displayed on the SEAS course schedule, or because they are still finalizing the course details\'');
    await queryRunner.query('COMMENT ON COLUMN "course"."isSEAS" IS \'Not all courses are delivered by SEAS, some are delivered by other divisions (for example, some courses may be science courses), therefore it may be desireable to denote such courses to differenciate them from courses offered by SEAS\'');
    await queryRunner.query('COMMENT ON COLUMN "campus"."name" IS \'Campus name (i.e - Allston)\'');
    await queryRunner.query('COMMENT ON COLUMN "building"."name" IS \'The building name (i.e - Maxwell Dworkin)\'');
    await queryRunner.query('COMMENT ON COLUMN "room"."name" IS \'The room name (i.e - Lecture Theatre)\'');
    await queryRunner.query('COMMENT ON COLUMN "room"."capacity" IS \'The number of people the room is able to accommodate\'');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."startTime" IS \'The time of day this event (meeting) begins in 24 hour time with ISO8601 timezone (e.g "19:15:40.328-04")\'');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."endTime" IS \'The time of day this event (meeting) ends in 24 hour time with ISO8601 timezone (e.g "19:15:40.328-04")\'');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."day" IS \'The day of the week this meeting occurs (i.e: Mon). Each record indicates a seperate ocurrance of a class. This means that a courses with sessions on Monday, Wednesday and Thursday should have 3 rows in this table for each seperate session. This allows split scheduling so that a class can occur at different times on different days\'');
    await queryRunner.query('COMMENT ON COLUMN "course_instance"."offered" IS \'Indicates wether the course is currently being offered this semester and whether the course would normally be offered in other semesters\'');
    await queryRunner.query('COMMENT ON COLUMN "course_instance"."preEnrollment" IS \'Students enrolled in this course before shopping week\'');
    await queryRunner.query('COMMENT ON COLUMN "course_instance"."studyCardEnrollment" IS \'Students enrolled in this course during shopping week\'');
    await queryRunner.query('COMMENT ON COLUMN "course_instance"."actualEnrollment" IS \'Students enrolled in this course after shopping week is over\'');
    await queryRunner.query('COMMENT ON COLUMN "semester"."academicYear" IS \'The academic year as a 4 digit integer\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('COMMENT ON COLUMN "semester"."academicYear" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course_instance"."actualEnrollment" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course_instance"."studyCardEnrollment" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course_instance"."preEnrollment" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course_instance"."offered" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."day" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."endTime" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "meeting"."startTime" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "room"."capacity" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "room"."name" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "building"."name" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "campus"."name" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course"."isSEAS" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course"."private" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course"."notes" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course"."number" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course"."prefix" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "course"."title" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "area"."name" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "faculty"."notes" IS NULL');
    await queryRunner.query('COMMENT ON COLUMN "faculty"."jointWith" IS NULL');
  }
}
