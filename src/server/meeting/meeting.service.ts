import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './meeting.entity';
import MeetingRequest from '../../common/dto/meeting/MeetingRequest.dto';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';
import { Semester } from '../semester/semester.entity';
import { LocationService } from '../location/location.service';
import { Room } from '../location/room.entity';

/**
 * A service for managing the individual meetings associated with course
 * instances and non-class events.
 */

@Injectable()
export class MeetingService {
  @InjectRepository(Meeting)
  private readonly meetingRepository: Repository<Meeting>;

  @InjectRepository(CourseInstance)
  private readonly ciRepository: Repository<CourseInstance>;

  @InjectRepository(NonClassEvent)
  private readonly nceRepository: Repository<NonClassEvent>;

  @InjectRepository(Room)
  private readonly roomRepository: Repository<Room>;

  @Inject(LocationService)
  private readonly locationService: LocationService;

  /**
   * Create a new meeting or update an existing meeting associated with
   * courseInstance or nonClassEvent.
   */
  public async saveMeeting(meetingData: MeetingRequest): Promise<Meeting> {
    const {
      id,
      roomId,
      courseInstanceId,
      nonClassEventId,
      ...meeting
    } = meetingData;

    // If the request has a id, it's an update to an existing meeting and we
    // need to get that entity from the database. If not, it's a new meeting
    // and we need to create a new entity. In either case, we can assign the
    // non-relational fields from our request to the entity
    let meetingToSave: Meeting;
    if (id) {
      meetingToSave = await this.meetingRepository
        .findOneOrFail(id);
    } else {
      meetingToSave = new Meeting();
    }
    Object.assign(meetingToSave, meeting);

    // The semester relationship exists on the courseInstance or the
    // nonClassEvent, and our request must have one of those fields defined.
    // Depending on which type of id we have, we'll pull the related entity
    // from the database and grab a reference to the semester
    let semester: Semester;
    if (courseInstanceId) {
      meetingToSave.courseInstance = await this.ciRepository
        .findOneOrFail(courseInstanceId, { relations: ['semester'] });
      ({ semester } = meetingToSave.courseInstance);
    } else {
      meetingToSave.nonClassEvent = await this.nceRepository
        .findOneOrFail(nonClassEventId, { relations: ['semester'] });
      ({ semester } = meetingToSave.nonClassEvent);
    }

    // It is permissible to create a meeting without a room, so we can ignore
    // the availability checks if there isn't a roomId in the request. If there
    // is a room Id in the request, we should make sure it's available before
    // assigning the room to the meeting
    if (roomId) {
      const bookings = await this.locationService
        .getRoomAvailability({
          ...meetingData,
          parentId,
          calendarYear,
          term,
        });
      // - If nothing is returned from the query, there are no bookings and we
      //   can book it.
      // - If there is a room returned, but the list of meetingTitles is empty,
      //   then there are no overlapping bookings and we can book it.
      // - If there is a room entry and there are any entries in the
      //   meetingTitles list, those meetings conflict with the requested meeting
      //   and we need to return false
      if (bookings.length === 0 || bookings[0].meetingTitles.length === 0) {
        meetingToSave.room = await this.roomRepository.findOne(roomId);
      } else {
        const { day, startTime, endTime } = meetingData;
        throw new BadRequestException(`This room is not available on ${day} between ${startTime} and ${endTime}. It is already booked for ${bookings[0].meetingTitles.join(', ')}`);
      }
    }

    return this.meetingRepository.save(meetingToSave);
  }
}
