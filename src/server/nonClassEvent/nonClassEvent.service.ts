import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TERM } from 'common/constants';
import { MeetingListingView } from 'server/meeting/MeetingListingView.entity';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { NonClassParentView } from './NonClassParentView.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';
import { Semester } from '../semester/semester.entity';
import { NonClassParent } from './nonclassparent.entity';
import { NonClassEvent } from './nonclassevent.entity';

export class NonClassEventService {
  @InjectRepository(NonClassParentView)
  private parentViewRepository: Repository<NonClassParentView>;

  @InjectRepository(Semester)
  private semesterRepository: Repository<Semester>;

  @InjectRepository(NonClassParent)
  private parentRepository: Repository<NonClassParent>;

  @InjectRepository(NonClassEvent)
  private eventRepository: Repository<NonClassEvent>;

  public async find(calendarYear: number):
  Promise<NonClassParentView[]> {
    const nonClassEvents = this.parentViewRepository.createQueryBuilder('p')
      .leftJoinAndMapOne(
        'p.spring',
        NonClassEventView, 'spring',
        'spring."nonClassParentId" = p."id" AND spring.term = :spring'
          + ' AND spring."calendarYear" = :calendarYear',
        {
          calendarYear,
          spring: TERM.SPRING,
        }
      )
      .leftJoinAndMapMany(
        'spring.meetings',
        MeetingListingView, 'spring_meetings',
        'spring_meetings."nonClassEventId" = spring.id'
      )
      .leftJoinAndMapOne(
        'spring_meetings.room',
        RoomListingView, 'spring_meetings_room',
        'spring_meetings_room.id = "spring_meetings"."roomId"'
      )
      .leftJoinAndMapOne(
        'p.fall',
        NonClassEventView, 'fall',
        'fall."nonClassParentId" = p."id" AND fall.term = :fall'
          + ' AND fall."calendarYear" = :calendarYear',
        {
          calendarYear,
          fall: TERM.FALL,
        }
      )
      .leftJoinAndMapMany(
        'fall.meetings',
        MeetingListingView, 'fall_meetings',
        'fall_meetings."nonClassEventId" = fall.id'
      )
      .leftJoinAndMapOne(
        'fall_meetings.room',
        RoomListingView, 'fall_meetings_room',
        'fall_meetings_room.id = "fall_meetings"."roomId"'
      )
      .orderBy('p.area', 'ASC');
    return nonClassEvents.getMany();
  }

  public async createWithNonClassEvents(parent: Partial<NonClassParent>):
  Promise<NonClassParent> {
    const semesters = await this.semesterRepository.find({});

    return this.parentRepository.save({
      ...this.parentRepository.create({
        ...parent,
        nonClassEvents: semesters.map(
          (event) => this.eventRepository.create(event)
        ),
      }),
    });
  }
}
