import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { TERM } from 'common/constants';
import { MeetingListingView } from 'server/meeting/MeetingListingView.entity';
import NonClassMeetingResponseDTO from 'common/dto/nonclassmeetings/NonClassMeeting.dto';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { NonClassParentView } from './NonClassParentView.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';

export class NonClassEventService {
  @InjectRepository(NonClassParentView)
  private parentRepository: Repository<NonClassParentView>;

  public async find(academicYear: number):
  Promise<NonClassParentView[]> {
    const nonClassEvents = await this.parentRepository.createQueryBuilder('p')
      .leftJoinAndMapOne(
        'p.course',
        Course, 'course',
        'course."id" = p."courseId"'
      )
      .leftJoinAndMapOne(
        'course.area',
        Area, 'area',
        'area."id" = course."areaId"'
      )
      .leftJoinAndMapOne(
        'p.spring',
        NonClassEventView, 'spring',
        'spring."nonClassParentId" = p."id" AND spring.term = :spring'
          + ' AND spring."academicYear" = :academicYear',
        {
          academicYear,
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
          + ' AND fall."academicYear" = :academicYear',
        {
          academicYear,
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
      .orderBy('area.name', 'ASC');
    return nonClassEvents.getMany();
  }
}
