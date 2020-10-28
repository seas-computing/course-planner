import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
} from 'typeorm';
import { Semester } from 'server/semester/semester.entity';
import { IS_SEAS, DAY } from 'common/constants';
import { CourseInstance } from './courseinstance.entity';
import { Meeting } from '../meeting/meeting.entity';
import { Course } from '../course/course.entity';
import { ScheduleEntryView } from './ScheduleEntryView.entity';

/**
 * [[CourseInstanceScheduleView]]s are used to generate the course timetable
 * in the client-side app. This view groups courses that have the same prefix,
 * startTime, and duration, and orders them by those same values (ASC).
 */

@ViewEntity('ScheduleBlockView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select('c.prefix', 'coursePrefix')
    .addSelect('m.day', 'weekday')
    .addSelect('s."academicYear"', 'calendarYear')
    .addSelect('s.term', 'term')
    .addSelect('EXTRACT(HOUR FROM m."startTime")', 'startHour')
    .addSelect('EXTRACT(MINUTE FROM m."startTime")', 'startMinute')
    .addSelect('EXTRACT(HOUR FROM m."endTime")', 'endHour')
    .addSelect('EXTRACT(MINUTE FROM m."endTime")', 'endMinute')
    .addSelect('EXTRACT(EPOCH FROM m."endTime"::TIME - m."startTime"::TIME) / 60', 'duration')
    .addSelect('CONCAT(c.prefix, m.day, TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), s.term, s."academicYear")', 'id')
    .distinct(true)
    .from(Course, 'c')
    .leftJoin(CourseInstance, 'ci', 'ci."courseId" = c.id')
    .innerJoin(Semester, 's', 's.id = ci."semesterId"')
    .innerJoin(Meeting, 'm', 'm."courseInstanceId" = ci.id')
    .groupBy('c.prefix')
    .addGroupBy('m.day')
    .addGroupBy('s."academicYear"')
    .addGroupBy('s.term')
    .addGroupBy('m."startTime"')
    .addGroupBy('m."endTime"')
    .addGroupBy('c."isSEAS"')
    .having(`c."isSEAS" <> '${IS_SEAS.N}'`),
})
export class ScheduleBlockView {
  /**
   * Concatenation of values from the [[Course]], [[Semester]], and
   * [[Meeeting]]. Will be used to group and associated course instances
   * from the same prefix occuring at the same time.
   * */

  @ViewColumn()
  public id: string;

  /**
   * From [[Course]]
   * The Schedule blocks will include all courses in the same prefix at the
   * same time, so we need to include the coursePrefix as a header
   */
  @ViewColumn()
  public coursePrefix: string;

  /**
   * From [[Meeting]]
   * The day of the week on which the block should be displayed
   */
  @ViewColumn()
  public weekday: DAY;

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
   * The class session that will be listed within this block
   */
  public courses: ScheduleEntryView[];
}
