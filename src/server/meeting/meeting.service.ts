import {
  Injectable, Inject, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository, getConnectionToken } from '@nestjs/typeorm';
import { Repository, Connection, EntityNotFoundError } from 'typeorm';
import { Meeting } from './meeting.entity';
import { MeetingRequestDTO } from '../../common/dto/meeting/MeetingRequest.dto';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';
import { LocationService } from '../location/location.service';
import { Room } from '../location/room.entity';
import { MeetingResponseDTO } from '../../common/dto/meeting/MeetingResponse.dto';
import { MeetingListingView } from './MeetingListingView.entity';
import { RoomListingView } from '../location/RoomListingView.entity';

/**
 * A service for managing the individual meetings associated with course
 * instances and non-class events.
 */

@Injectable()
export class MeetingService {
  @InjectRepository(Meeting)
  private readonly meetingRepository: Repository<Meeting>;

  @InjectRepository(Room)
  private readonly roomRepository: Repository<Room>;

  @Inject(LocationService)
  private readonly locationService: LocationService;

  @InjectRepository(MeetingListingView)
  private readonly meetingListingRepository: Repository<MeetingListingView>;

  @InjectRepository(CourseInstance)
  private readonly courseInstanceRepository: Repository<CourseInstance>;

  @InjectRepository(NonClassEvent)
  private readonly nonClassEventRepository: Repository<CourseInstance>;

  @Inject(getConnectionToken())
  private readonly connection: Connection;

  /**
   * A generic save method that can update either a course instance or
   * non-class event with a new list of meetings
   *
   */
  public async saveMeetings(
    parentId: string,
    meetingList: MeetingRequestDTO[]
  ): Promise<MeetingResponseDTO[]> {
    // Need to retrieve the parent instance from the database. Since the parent of
    // a meeting can be either a CourseInstance or a NonClassEvent, we're using
    // the `findOneOrFail` repository methods with try ... catch blocks to get
    // whichever type has an entity with the passed Id. Using exception
    // handling for control flow is not ideal, but this seems to be the most
    // efficient way to handle this case.
    let parent: CourseInstance | NonClassEvent;
    try {
      parent = await this.courseInstanceRepository
        .findOneOrFail(parentId, { relations: ['semester'] });
    } catch (ciError) {
      if (ciError instanceof EntityNotFoundError) {
        try {
          parent = await this.nonClassEventRepository
            .findOneOrFail(parentId, { relations: ['semester'] });
        } catch (nceError) {
          if (nceError instanceof EntityNotFoundError) {
            throw new EntityNotFoundError(
              {
                name: 'Course Instance or Non-Class Event',
                type: parent,
              },
              {
                id: parentId,
              }
            );
          } else {
            throw nceError;
          }
        }
      } else {
        throw ciError;
      }
    }

    parent.meetings = await Promise.all(
      meetingList.map(
        async (meeting) => this.validateAndCreate(meeting, parent)
      )
    );

    // The manager.save method allows for saving entities without needing to
    // specify the repository.
    const savedParent = await this.connection.manager.save(parent);

    // Our [[MeetingResponseDTO]] expects a richer room object that includes
    // the [[Campus]] and [[Building]]/[[Room]] concatenated name. It is legal
    // to create a [[Meeting]] without an associated room, so the fallback returns
    // a meeting with `room: undefined`
    return this.meetingListingRepository
      .createQueryBuilder('m')
      .where('m."courseInstanceId"=:pid', { pid: savedParent.id })
      .orWhere('m."nonClassEventId"=:pid', { pid: savedParent.id })
      .orderBy('day', 'ASC')
      .addOrderBy('"startTime"', 'ASC')
      .addOrderBy('"endTime"', 'ASC')
      .leftJoinAndMapOne('m.room', RoomListingView, 'room', 'room.id=m."roomId"')
      .getMany();
  }

  /**
   * Create a new meeting or update an existing meeting associated with
   * courseInstance or nonClassEvent.
   */
  private async validateAndCreate(
    meetingData: MeetingRequestDTO,
    parentData: CourseInstance | NonClassEvent
  ): Promise<Meeting> {
    const {
      id: meetingId,
      roomId,
    } = meetingData;

    const {
      id: parentId,
      semester: {
        academicYear: calendarYear,
        term,
      },
    } = parentData;

    let meetingToSave: Meeting;
    if (meetingId) {
      meetingToSave = await this.meetingRepository.preload(meetingData);
    } else {
      meetingToSave = this.meetingRepository.create(meetingData);
    }

    // It is permissible to create a meeting without a room, so we can ignore
    // the availability checks if there isn't a roomId in the request. If there
    // is a room Id in the request, we should make sure it's available before
    // assigning the room to the meeting
    if (roomId) {
      const bookings = await this.locationService
        .getRoomBookings({
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
    } else {
      meetingToSave.room = null;
    }

    return meetingToSave;
  }
}
