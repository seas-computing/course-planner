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
  meetings: RoomBookingInfoView[];
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
   * term, day, start time, and end time
   */
  public async getRooms(
    roomInfo: RoomRequest
  ): Promise<RoomResponse[]> {
    const result = await this.roomListingViewRepository
      .createQueryBuilder('r')
      .leftJoinAndMapMany('r.meetings', RoomBookingInfoView, 'b',
        `r.id = b."roomId" AND b."calendarYear" = :calendarYear
          AND b.term = :term
          AND b.day = :day
          AND (b."startTime", b."endTime") OVERLAPS (:startTime::TIME, :endTime::TIME)`,
        roomInfo)
      .orderBy('r.campus', 'ASC')
      .addOrderBy('r.name', 'ASC')
      .getMany() as unknown[] as RoomQueryResult[];
    return result.map(({ meetings, ...row }) => ({
      ...row,
      meetingTitles: meetings.map(({ meetingTitle }) => meetingTitle),
    }));
  }
}
