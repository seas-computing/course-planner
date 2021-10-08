import {
  ViewEntity, ViewColumn, Connection, SelectQueryBuilder,
} from 'typeorm';
import { Room } from './room.entity';
import { Meeting } from '../meeting/meeting.entity';
import { DAY, TERM } from '../../common/constants';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';
import { NonClassParent } from '../nonClassEvent/nonclassparent.entity';
import { Course } from '../course/course.entity';
import { Semester } from '../semester/semester.entity';
import { Building } from './building.entity';

/**
 * Represents the data associated with a room being booked for a meeting. Can
 * be used to query whether a room is available at a certain time by the year,
 * term, day, startTime, and endTime.
 */

@ViewEntity('RoomBookingInfoView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Meeting> => connection.createQueryBuilder()
    .select('r.id', 'roomId')
    .addSelect("CONCAT_WS(' ', b.name, r.name)", 'roomName')
    .addSelect('s."academicYear"', 'calendarYear')
    .addSelect('s.term', 'term')
    .addSelect('m."startTime"', 'startTime')
    .addSelect('m."endTime"', 'endTime')
    .addSelect('m.day', 'day')
    .addSelect('COALESCE(m."courseInstanceId", m."nonClassEventId")', 'parentId')
    .addSelect(`CASE
               WHEN m."courseInstanceId" IS NOT NULL
               THEN CONCAT_WS(' ', c.prefix, c.number)
               WHEN m."nonClassEventId" IS NOT NULL
               THEN ncp.title
               END`, 'meetingTitle')
    .from(Meeting, 'm')
    .leftJoin(Room, 'r', 'r.id = m."roomId"')
    .leftJoin(Building, 'b', 'b.id = r."buildingId"')
    .leftJoin(CourseInstance, 'ci', 'm."courseInstanceId" = ci.id')
    .leftJoin(Course, 'c', 'ci."courseId" = c.id')
    .leftJoin(NonClassEvent, 'nce', 'm."nonClassEventId" = nce.id')
    .leftJoin(NonClassParent, 'ncp', 'nce."nonClassParentId" = ncp.id')
    .leftJoin(Semester, 's', 'COALESCE(ci."semesterId", nce."semesterId") = s.id'),
})

export class RoomBookingInfoView {
  /**
   * The id of the room associated with this booking
   */
  @ViewColumn()
  public roomId: string;

  /**
   * The concatenated building & number of the room
   */
  @ViewColumn()
  public roomName: string;

  /**
   * The term in which this booking is scheduled
   */
  @ViewColumn()
  public term: TERM;

  /**
   * The year in which this booking is scheduled
   * Note that academicYear in the semester table is actually calendar year
   */
  @ViewColumn()
  public calendarYear: string;

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

  /**
   * The id of the courseInstance or nonClassEvent to which this meeting is related
   */
  @ViewColumn()
  public parentId: string;
}
