import {
  ViewEntity, ViewColumn, Connection, SelectQueryBuilder,
} from 'typeorm';
import { Room } from '../location/room.entity';
import { Meeting } from '../meeting/meeting.entity';
import { DAY, TERM } from '../../common/constants';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';
import { NonClassParent } from '../nonClassParent/nonclassparent.entity';
import { Course } from '../course/course.entity';
import { Semester } from '../semester/semester.entity';

/**
 * Represents the data associated with a room being booked for a meeting. Can
 * be used to query whether a room is available at a certain time by the year,
 * term, day, startTime, and endTime.
 */

@ViewEntity('RoomBookingInfoView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Meeting> => connection.createQueryBuilder()
    .select('r.id', 'roomId')
    .addSelect('s.academicYear', 'year')
    .addSelect('s.term', 'term')
    .addSelect('m."startTime"', 'startTime')
    .addSelect('m."endTime"', 'endTime')
    .addSelect('m.day', 'day')
    .addSelect(`CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', c.prefix, c.number)
               WHEN m."nonClassEventId" IS NOT NULL
               THEN nce.title
               END`, 'meetingTitle')
    .from(Meeting, 'm')
    .leftJoin(Room, 'r', 'r.id = m."roomId"')
    .leftJoin(CourseInstance, 'ci', 'm."courseInstanceId" = ci.id')
    .leftJoin(Course, 'c', 'ci."courseId" = c.id')
    .leftJoin(NonClassEvent, 'nce', 'm."nonClassEventId" = nce.id')
    .leftJoin(NonClassParent, 'ncp', 'nce."nonClassParentId" = ncp.id')
    .leftJoin(Semester, 's', 'COALESCE(ci."semesterId", nce."semesterId") = s.id'),
})
export class RoomBookingView {
  /**
   * The id of the room associated with this booking
   */
  @ViewColumn()
  public roomId: string;

  /**
   * The term in which this booking is scheduled
   */
  @ViewColumn()
  public term: TERM;

  /**
   * The year in which this booking is scheduled
   */
  @ViewColumn()
  public year: string;

  /**
   * The time at which this booking starts
   */
  @ViewColumn()
  public startTime: string;

  /**
   * The time at which this booking ends
   */
  @ViewColumn()
  public endTime: string;

  /**
   * The day on which this booking takes place
   */
  @ViewColumn()
  public day: DAY;

  /**
   * The title of the meeting taking place
   */
  @ViewColumn()
  public meetingTitle: string;
}
