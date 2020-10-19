import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
  JoinColumn,
  ManyToOne,
  ObjectType,
} from 'typeorm';
import { Semester } from 'server/semester/semester.entity';
import { CourseInstance } from './courseinstance.entity';
import { MeetingListingView } from '../meeting/MeetingListingView.entity';
import { Course } from '../course/course.entity';
import { ScheduleBlockView } from './ScheduleBlockView.entity';
import { RoomListingView } from '../location/RoomListingView.entity';

/**
 * [[CourseInstanceScheduleView]]s are used to generate the course timetable
 * in the client-side app. This view groups courses that have the same prefix,
 * startTime, and duration, and orders them by those same values (ASC).
 */

@ViewEntity('ScheduleEntryView', {
  expression: (connection: Connection):
  SelectQueryBuilder<CourseInstance> => connection
    .createQueryBuilder()
    .select('m.id', 'id')
    .addSelect('c.number', 'courseNumber')
    .addSelect('c.isUndergraduate', 'isUndergraduate')
    .addSelect('r.name', 'room')
    .addSelect('r.campus', 'campus')
    .addSelect('m."startTime"', 'startTime')
    .addSelect('m."endTime"', 'endTime')
    .addSelect('CONCAT(c.prefix, m.day, TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), s.term, s."academicYear")', 'blockId')
    .from(CourseInstance, 'ci')
    .leftJoin(Course, 'c', 'ci."courseId" = c.id')
    .innerJoin(Semester, 's', 's.id = ci."semesterId"')
    .innerJoin(MeetingListingView, 'm', 'm."courseInstanceId" = ci.id')
    .leftJoin(RoomListingView, 'r', 'r.id = m."roomId"')
    .where('c."isSEAS" <> \'N\''),
})
export class ScheduleEntryView {
  /**
   * From [[Meeting]]
   * The id of the specific meeting of the course in the specific semester
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Course]]
   * The "number" portion of the course name
   */
  @ViewColumn()
  public courseNumber: string;

  /**
   * From [[Course]]
   * Indicates whether the course is offered to undergraduates
   */
  @ViewColumn()
  public isUndergraduate: boolean;

  /**
   * From [[Meeting]]
   * The formatted starting time of the class meeting
   */
  @ViewColumn()
  public startTime: string;

  /**
    * From [[Meeting]]
    * The formatted ending time of the class meeting
    */
  @ViewColumn()
  public endTime: string;

  /**
   * From [[Meeting]]
   * The name of the room where the course will take place
   */
  @ViewColumn()
  public campus: string;

  /**
   * From [[Meeting]]
   * The name of the room where the course will take place
   */
  @ViewColumn()
  public room: string;

  /**
   * The ID of the schedule block where the course should appear
   * Many [[CourseInstanceScheduleEntryView]]s can have one [[CourseInstanceScheduleBlockView]]
   */
  @ManyToOne(
    (): ObjectType<ScheduleBlockView> => ScheduleBlockView,
    ({ courses }): ScheduleEntryView[] => courses
  )
  @JoinColumn()
  public blockId: string;
}
