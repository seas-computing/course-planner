import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomBookingInfoView } from './RoomBookingInfoView.entity';

@Injectable()
export class LocationService {
  @InjectRepository(RoomBookingInfoView)
  private readonly roomBookRepository: Repository<RoomBookingInfoView>;

  public async checkRoomAvailability(
    details: Partial<RoomBookingInfoView>
  ): Promise<boolean> {
    const {
      roomId,
      calendarYear,
      term,
      day,
      startTime,
      endTime,
    } = details;
    const bookings = await this.roomBookRepository.createQueryBuilder()
      .select('array_agg("meetingTitle")')
      .groupBy('"roomId"')
      .addGroupBy('"calendarYear"')
      .addGroupBy('term')
      .addGroupBy('day')
      .where('"roomId"=:roomId', { roomId })
      .andWhere('term=:term', { term })
      .andWhere('"calendarYear"=:calendarYear', { calendarYear })
      .andWhere('"day"=:day', { day })
      .andWhere(
        '(:startTime, :endTime) OVERLAPS ("startTime", "endTime")',
        { startTime, endTime }
      )
      .getRawMany();
    return bookings.length === 0;
  }
}
