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
export class LocationService {
  @InjectRepository(RoomListingView)
  private readonly roomListingViewRepository: Repository<RoomListingView>;

  @InjectRepository(RoomBookingInfoView)
  private readonly roomBookingInfoViewRepository:
  Repository<RoomBookingInfoView>;

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
          AND ((b."startTime", b."endTime") OVERLAPS (:startTime, :endTime))`,
        roomInfo)
      .getMany() as unknown[] as RoomQueryResult[];
    return result.map(({ meetings, ...row }) => ({
      ...row,
      meetingTitles: meetings.map(({ meetingTitle }) => meetingTitle),
    }));
  }
}
