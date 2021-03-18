import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomBookingInfoView } from './RoomBookingInfoView.entity';

/**
 * A service for managing room, building, and campus entities in the database.
 */

export interface Booking {
  roomId: string;
  meetingTitles: string[];
}

@Injectable()
export class LocationService {
  @InjectRepository(RoomBookingInfoView)
  private readonly roomBookingRepository: Repository<RoomBookingInfoView>;

  /**
   * Queries the view of room booking info in our database for any existing
   * bookings that might overlap with the meeting represented by the data in
   * the details argument. Returns true when there are no conflicts, and false
   * when there is a conflict
   */

  public async getRoomAvailability(
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
        '(:startTime, :endTime) OVERLAPS ("startTime", "endTime")',
        { startTime, endTime }
      )
      .getRawMany();
  }
}
