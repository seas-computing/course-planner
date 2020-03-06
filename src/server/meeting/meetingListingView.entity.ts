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
import { CourseInstanceListingView } from 'server/courseInstance/courseInstanceListingView.entity';
import { RoomListingView } from 'server/location/roomListingView.entity';
import { Meeting } from './meeting.entity';

@ViewEntity('MeetingListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Meeting> => connection.createQueryBuilder()
    .select('m.id', 'id')
    .addSelect('m."courseInstanceId"', 'courseInstanceId')
    .addSelect('m.day', 'day')
    .addSelect('TO_CHAR(CAST (m."startTime" AS TIME), \'HH12:MI AM\')', 'startTime')
    .addSelect('TO_CHAR(CAST (m."endTime" AS TIME), \'HH12:MI AM\')', 'endTime')
    .addSelect('m."roomId"', 'roomId')
    .from(Meeting, 'm'),
})
export class MeetingListingView {
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public day: DAY;

  @ViewColumn()
  public startTime: string;

  @ViewColumn()
  public endTime: string;

  public room: RoomListingView;

  @JoinColumn()
  @ManyToOne(
    (): ObjectType<RoomListingView> => RoomListingView,
    ({ meetings }): MeetingListingView[] => meetings
  )
  public roomId: string;

  @JoinColumn()
  @ManyToOne(
    (): ObjectType<CourseInstanceListingView> => CourseInstanceListingView,
    ({ meetings }): MeetingListingView[] => meetings
  )
  public courseInstanceId: string;
}
