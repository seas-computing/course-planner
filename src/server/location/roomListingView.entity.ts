import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  OneToMany,
  ObjectType,
  JoinColumn,
} from 'typeorm';
import { Room } from 'server/location/room.entity';
import { Building } from 'server/location/building.entity';
import { MeetingListingView } from 'server/meeting/meetingListingView.entity';

@ViewEntity('RoomListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Room> => connection.createQueryBuilder()
    .select('r.id', 'id')
    .addSelect("CONCAT_WS(' ', b.name, r.name)", 'name')
    .leftJoin(Building, 'b', 'r."buildingId" = b.id')
    .from(Room, 'r'),
})
export class RoomListingView {
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public name: string;

  @OneToMany(
    (): ObjectType<RoomListingView> => RoomListingView,
    ({ meetings }): MeetingListingView[] => meetings
  )
  @JoinColumn()
  public meetings: MeetingListingView[];
}
