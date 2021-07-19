import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomRequest from 'common/dto/room/RoomRequest.dto';
import { RoomBookingInfoView } from './RoomBookingInfoView.entity';

/**
 * A service for managing room, building, and campus entities in the database.
 */

export interface Booking {
  roomId: string;
  meetingTitles: string[];
}

interface RoomQueryResult {
  id: string;
  campus: string;
  name: string;
  capacity: number;
  meetings: string[];
}

@Injectable()
export class LocationService {
  @InjectRepository(RoomListingView)
  private readonly roomListingViewRepository: Repository<RoomListingView>;

  @InjectRepository(RoomBookingInfoView)
  private readonly roomBookingRepository: Repository<RoomBookingInfoView>;

  /**
   * Queries the view of room booking info in our database for any existing
   * bookings that might overlap with the meeting represented by the data in
   * the details argument. Returns true when there are no conflicts, and false
   * when there is a conflict
   */

  public async getRoomBookings(
    details: Partial<RoomBookingInfoView>
  ): Promise<Booking[]> {
    const {
      roomId,
      calendarYear,
      term,
      day,
      startTime,
      endTime,
      parentId,
    } = details;

    return this.roomBookingRepository
      .createQueryBuilder()
      .select('"roomId"')
      .addSelect('array_agg("meetingTitle")', 'meetingTitles')
      .groupBy('"roomId"')
      .addGroupBy('"calendarYear"')
      .addGroupBy('term')
      .addGroupBy('day')
      .where('"roomId"=:roomId', { roomId })
      .andWhere('"parentId"!=:parentId', { parentId })
      .andWhere('term=:term', { term })
      .andWhere('"calendarYear"=:calendarYear', { calendarYear })
      .andWhere('day=:day', { day })
      .andWhere(
        '(:startTime::TIME, :endTime::TIME) OVERLAPS ("startTime", "endTime")',
        { startTime, endTime }
      )
      .getRawMany();
  }

  /**
   * Resolves with a list of rooms and the course instance and/or non class
   * meetings that are scheduled to occur during the requested calendar year,
   * term, day, start time, and end time.
   *
   * If the RoomRequest data includes an `exludeParent` property with the UUID
   * of a [[CourseInstance]] or [[NonClassEvent]], it will not show that
   * meeting in the list of meetings. This is mostly necessary when populating
   * the [[RoomSelectionTable]] on the client, so that users can change the
   * room associated with a meeting then change it back. It's implemented on
   * the server so that we can strictly compare by UUID, not by the
   * (potentially not unique) meeting title string.
   */
  public async getRooms(
    {
      excludeParent,
      ...roomInfo
    }: RoomRequest
  ): Promise<RoomResponse[]> {
    const roomQuery = this.roomListingViewRepository
      .createQueryBuilder('r')
      .leftJoin((qb) => {
        const subQuery = qb
          .select('"meetingTitle"')
          .addSelect('"roomId"')
          .from(RoomBookingInfoView, 'b')
          .where('"calendarYear" = :calendarYear')
          .andWhere('term = :term')
          .andWhere('day = :day')
          .andWhere('("startTime", "endTime") OVERLAPS (:startTime::TIME, :endTime::TIME)');
        if (excludeParent) {
          subQuery.andWhere('"parentId" <> :excludeParent', { excludeParent });
        }
        return subQuery.setParameters(roomInfo);
      }, 'b', 'r.id = b."roomId"')
      .select('r.id', 'id')
      .addSelect('r.campus', 'campus')
      .addSelect('r.name', 'name')
      .addSelect('r.capacity', 'capacity')
      .addSelect('array_agg("b"."meetingTitle")', 'meetings')
      .groupBy('r.id')
      .addGroupBy('r.campus')
      .addGroupBy('r.name')
      .addGroupBy('r.capacity')
      .orderBy('r.campus', 'ASC')
      .addOrderBy('r.name', 'ASC');
    const result = await roomQuery
      .getRawMany();
    return result.map(({ meetings, ...row }: RoomQueryResult) => ({
      ...row,
      meetingTitles: meetings
        .filter((title) => !!title),
    }));
  }
}
