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
import { Campus } from 'server/location/campus.entity';
import { MeetingListingView } from 'server/meeting/MeetingListingView.entity';

/**
 * Combines the building and room number into a single field to be associated
 * with meetings.
 *
 * Does not presently include Campus data, as that's not specified in the
 * [[CourseInstanceResponseDTO]]
 */

@ViewEntity('RoomListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Room> => connection.createQueryBuilder()
    .select('r.id', 'id')
    .addSelect("CONCAT_WS(' ', b.name, r.name)", 'name')
    .addSelect('c.name', 'campus')
    .addSelect('r.capacity', 'capacity')
    .leftJoin(Building, 'b', 'r."buildingId" = b.id')
    .leftJoin(Campus, 'c', 'b."campusId" = c.id')
    .from(Room, 'r'),
})
export class RoomListingView {
  /**
   * From [[Room]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Building]] and [[Room]]
   * Combines the building name with room number
   */

  @ViewColumn()
  public name: string;

  /**
   * From [[Campus]]
   * The name of the campus where the building is located
   */
  @ViewColumn()
  public campus: string;

  /**
   * From [[Room]]
   * The maximum capacity of the room
   */
  @ViewColumn()
  public capacity: number;

  /**
   * One [[Room]] can have many [[MeetingListingView]]
   */

  @OneToMany(
    (): ObjectType<RoomListingView> => RoomListingView,
    ({ meetings }): MeetingListingView[] => meetings
  )
  @JoinColumn()
  public meetings: MeetingListingView[];
}
