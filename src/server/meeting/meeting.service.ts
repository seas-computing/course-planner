import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';
import MeetingRequest from '../../common/dto/meeting/MeetingRequest.dto';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';
import { Semester } from '../semester/semester.entity';
import { RoomService } from '../location/room.service';

@Injectable()
export class MeetingService {
  @InjectRepository(Meeting)
  private readonly meetingRepository: Repository<Meeting>;

  @InjectRepository(CourseInstance)
  private readonly ciRepository: Repository<CourseInstance>;

  @InjectRepository(NonClassEvent)
  private readonly nceRepository: Repository<NonClassEvent>;

  @Inject(RoomService)
  private readonly roomService: RoomService;

  /**
   * Create a new meeting associated with courseInstance or nonClassEvent
   */
  public async saveMeeting(meetingData: MeetingRequest): Promise<Meeting> {
    const {
      id,
      courseInstanceId,
      nonClassEventId,
    } = meetingData;
    if (id === undefined) {
      let semester: Semester;
      if (courseInstanceId !== undefined) {
        ({ semester } = await this.ciRepository.findOne(courseInstanceId));
      } else if (nonClassEventId !== undefined) {
        ({ semester } = await this.nceRepository.findOne(nonClassEventId));
      }
      if (semester) {
        const { academicYear: calendarYear, term } = semester;
        const isAvailable = await this.roomService
          .checkRoomAvailability({
            ...meetingData,
            calendarYear,
            term,
          });
        if (isAvailable) {
          return this.meetingRepository.save(meetingData);
        }
        throw new BadRequestException('This room is not available at this time');
      }
      throw new BadRequestException('No semester is associated with this request');
    }
  }
}
