import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { RoomBookingInfoView } from 'server/location/RoomBookingInfoView.entity';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomRequest from 'common/dto/room/RoomRequest.dto';

interface RoomQueryResult {
  id: string;
  campus: string;
  name: string;
  capacity: number;
  meetings: RoomBookingInfoView[];
}

@Injectable()
export class RoomService {
  @InjectRepository(RoomListingView)
  private readonly roomListingViewRepository: Repository<RoomListingView>;

  @InjectRepository(RoomBookingInfoView)
  private readonly roomBookingInfoViewRepository:
  Repository<RoomBookingInfoView>;

  /** Resolves with a list of rooms and the course instance and/or non class
   * meetings that are scheduled to occur during the requested calendar year,
   * term, day, start time, and end time
   */
  public async getRooms(
    roomInfo: RoomRequest
  ): Promise<RoomResponse[]> {
    const {
      calendarYear,
      term,
      day,
      startTime,
      endTime,
    } = roomInfo;
    const result = await this.roomListingViewRepository
      .createQueryBuilder('r')
      .select('r.id', 'id')
      .addSelect('r.campus', 'campus')
      .addSelect('r.name', 'name')
      .addSelect('r.capacity', 'capacity')
      .leftJoinAndMapMany('r.meetings', RoomBookingInfoView, 'b', 'r.id = b."roomId"')
      .where('b."calendarYear" = :calendarYear', { calendarYear })
      .andWhere('b.term = :term', { term })
      .andWhere('b.day = :day', { day })
      .andWhere('(b."startTime" <= :startTime && b."endTime" >= :endTime) || (b."startTime" >= :startTime && b."startTime" < :endTime) || (b."endTime" > :startTime && b."endTime" <= :endTime)', { startTime, endTime })
      .getMany() as unknown[] as RoomQueryResult[];
    return result.map((row) => ({
      ...row,
      meetingTitles: row.meetings.map(({ meetingTitle }) => meetingTitle),
    }));
  }
}
