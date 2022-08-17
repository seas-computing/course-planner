import { DAY, IS_SEAS, TERM } from 'common/constants';
import { RoomScheduleInstructors } from 'common/dto/schedule/roomSchedule.dto';
import { Course } from 'server/course/course.entity';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import { Meeting } from 'server/meeting/meeting.entity';
import { Semester } from 'server/semester/semester.entity';
import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
} from 'typeorm';
import { CourseInstance } from './courseinstance.entity';

@ViewEntity('RoomScheduleBlockView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
    .addSelect('c.title', 'title')
    .addSelect('c."isUndergraduate"', 'isUndergraduate')
    .addSelect('m.day', 'weekday')
    .addSelect('m."roomId"', 'roomId')
    .addSelect('s."academicYear"', 'calendarYear')
    .addSelect('s.term', 'term')
    .addSelect('EXTRACT(HOUR FROM m."startTime")', 'startHour')
    .addSelect('EXTRACT(MINUTE FROM m."startTime")', 'startMinute')
    .addSelect('EXTRACT(HOUR FROM m."endTime")', 'endHour')
    .addSelect('EXTRACT(MINUTE FROM m."endTime")', 'endMinute')
    .addSelect('EXTRACT(EPOCH FROM m."endTime"::TIME - m."startTime"::TIME) / 60', 'duration')
    .addSelect('CONCAT(c.prefix, c.number, m.day, TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), s.term, s."academicYear")', 'id')
    .from(Course, 'c')
    .leftJoin(CourseInstance, 'ci', 'ci."courseId" = c.id')
    .innerJoin(Semester, 's', 's.id = ci."semesterId"')
    .innerJoin(Meeting, 'm', 'm."courseInstanceId" = ci.id')
    .leftJoinAndMapMany(
      'ci.faculty',
      FacultyListingView,
      'instructors',
      'instructors."courseInstanceId" = ci.id'
    )
    .where(`c."isSEAS" <> '${IS_SEAS.N}'`),
})
export class RoomScheduleBlockView {
  /**
   * Concatenation of values from the [[Course]], [[Semester]], and
   * [[Meeeting]]. Will be used to find the course instances occurring
   * during a given term and room.
   * */

  @ViewColumn()
  public id: string;

  /**
   * From [[Course]]
   * The course prefix concatenated with the course number.
   */
  @ViewColumn()
  public catalogNumber: string;

  /**
   * From [[Course]]
   * The course title
   */
  @ViewColumn()
  public title: string;

  /**
   * The instructors associated with the course instance
   */
  @ViewColumn()
  public instructors: RoomScheduleInstructors[];

  /**
   * From [[Course]]
   * Indicates whether the course is classified as an undergraduate course
   */
  @ViewColumn()
  public isUndergraduate: boolean;

  /**
   * From [[Meeting]]
   * The day of the week on which the block should be displayed
   */
  @ViewColumn()
  public weekday: DAY;

  /**
   * From [[Meeting]]
   * The ID of the room, used to filter the room schedule for a particular room
   */
  @ViewColumn()
  public roomId: string;

  /**
   * From [[Semester]]
   * The calendar year of the instance
   */
  @ViewColumn()
  public calendarYear: string;

  /**
   * From [[Semester]]
   * The term of the instance
   */
  @ViewColumn()
  public term: TERM;

  /**
   * From [[Meeting]]
   * The hour portion of the time at which the meeting begins
   */
  @ViewColumn()
  public startHour: number;

  /**
   * From [[Meeting]]
   * The minute portion of the time at which the meeting begins
   */
  @ViewColumn()
  public startMinute: number;

  /**
    * From [[Meeting]]
    * The hour portion of the time at which the meeting ends
    */
  @ViewColumn()
  public endHour: number;

  /**
    * From [[Meeting]]
    * The minute portion of the time at which the meeting ends
    */
  @ViewColumn()
  public endMinute: number;

  /**
   * From [[Meeting]]
   * The length of the meeting, in minutes.
   */
  @ViewColumn()
  public duration: number;

  /**
   * From [[Faculty]]
   * A concatenation of the form lastName, firstName
   */
  @ViewColumn()
  public displayName: string;

  /**
   * From [[Faculty]]
   * Notes specific to the faculty member outlining preferences and additional information
   */
  @ViewColumn()
  public notes: string;

  /**
   * From [[FacultyCourseInstance]]
   * An index associated with the instructor that indicates what their order is
   * in relation to other instructors of the same course instance.
   */
  @ViewColumn()
  public instructorOrder: number;
}
