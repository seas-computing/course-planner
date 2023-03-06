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
import { IS_SEAS } from 'common/constants';
import { CourseInstance } from './courseinstance.entity';
import { Meeting } from '../meeting/meeting.entity';
import { Course } from '../course/course.entity';
import { ScheduleBlockView } from './ScheduleBlockView.entity';
import { Room } from '../location/room.entity';
import { Building } from '../location/building.entity';
import { Campus } from '../location/campus.entity';

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
    .addSelect('ci.id', 'instanceId')
    .addSelect('c.number', 'courseNumber')
    .addSelect('c.isUndergraduate', 'isUndergraduate')
    .addSelect("CONCAT_WS(' ', b.name, r.name)", 'room')
    .addSelect('campus.name', 'campus')
    .addSelect('CONCAT(c.prefix, m.day, TO_CHAR(m."startTime"::TIME, \'HH24MI\'), TO_CHAR(m."endTime"::TIME, \'HH24MI\'), s.term, s."academicYear")', 'blockId')
    .from(CourseInstance, 'ci')
    .leftJoin(Course, 'c', 'c.id = COALESCE(c."sameAsId", ci."courseId")')
    .innerJoin(Semester, 's', 's.id = ci."semesterId"')
    .innerJoin(Meeting, 'm', 'm."courseInstanceId" = ci.id')
    .leftJoin(Room, 'r', 'r.id = m."roomId"')
    .leftJoin(Building, 'b', 'b.id = r."buildingId"')
    .leftJoin(Campus, 'campus', 'campus.id = b."campusId"')
    .where(`c."isSEAS" <> '${IS_SEAS.N}'`),
})
export class ScheduleEntryView {
  /**
   * From [[Meeting]]
   * The id of the specific meeting of the course in the specific semester
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[CourseInstance]]
   * The ID of the parent Course Instance, used to link multiple meetings within a week.
   */
  @ViewColumn()
  public instanceId: string;

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
