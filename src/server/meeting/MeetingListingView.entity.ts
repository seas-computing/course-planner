import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  ManyToOne,
  ObjectType,
  JoinColumn,
} from 'typeorm';
import { DAY } from 'common/constants';
import { CourseInstanceListingView } from 'server/courseInstance/CourseInstanceListingView.entity';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { Meeting } from './meeting.entity';
import { NonClassEventView } from 'server/nonClassEvent/NonClassEvent.view.entity';

/**
 * Consolidates data about a [[CourseInstances]] associated [[Meeting]]s to
 * associate with a [[CourseInstanceListingView]].
 */

@ViewEntity('MeetingListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Meeting> => connection.createQueryBuilder()
    .select('m.id', 'id')
    .addSelect('m."courseInstanceId"', 'courseInstanceId')
    .addSelect('m."nonClassEventId"', 'nonClassEventId')
    .addSelect('m.day', 'day')
    .addSelect('TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\')', 'startTime')
    .addSelect('TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\')', 'endTime')
    .addSelect('m."roomId"', 'roomId')
    .from(Meeting, 'm'),
})
export class MeetingListingView {
  /**
   * From [[Meeting]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Meeting]]
   * The day of the week on which the meeting occurs
   */
  @ViewColumn()
  public day: DAY;

  /**
   * From [[Meeting]]
   * The time at which the meeting starts, in the format 01:30 PM
   */
  @ViewColumn()
  public startTime: string;

  /**
   * From [[Meeting]]
   * The time at which the meeting ends, in the format 02:15 PM
   */
  @ViewColumn()
  public endTime: string;

  /**
   * The [[RoomListingView]] representing where this meeting will take place
   */
  public room: RoomListingView;

  /**
   * Many [[MeetingListingView]]s can have one [[RoomListingView]]
   */
  @JoinColumn()
  @ManyToOne(
    (): ObjectType<RoomListingView> => RoomListingView,
    ({ meetings }): MeetingListingView[] => meetings
  )
  public roomId: string;

  /**
   * Many [[MeetingListingView]]s can have one [[CourseInstanceListingView]]
   */
  @JoinColumn()
  @ManyToOne(
    (): ObjectType<CourseInstanceListingView> => CourseInstanceListingView,
    ({ meetings }): MeetingListingView[] => meetings
  )
  public courseInstanceId: string;


  /**
   * Many [[MeetingListingView]]s can have one [[NonClassEventView]]
   */
  @JoinColumn()
  @ManyToOne(
    (): ObjectType<NonClassEventView> => NonClassEventView,
    ({ meetings }): MeetingListingView[] => meetings
  )
  public nonClasseventId: string;
}
