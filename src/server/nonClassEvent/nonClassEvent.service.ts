import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { TERM } from 'common/constants';
import { Meeting } from 'server/meeting/meeting.entity';
import { NonClassParentView } from './NonClassParentView.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';

export class NonClassEventService {
  @InjectRepository(NonClassParentView)
  private parentRepository: Repository<NonClassParentView>;

  public async find(academicYear: number = 2020):
  Promise<NonClassParentView[]> {
    return this.parentRepository.createQueryBuilder('p')
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
        `spring."nonClassParentId" = p."id" AND spring.term = '${TERM.SPRING}'`
          + ` AND spring."academicYear" = ${academicYear}`
      )
      .leftJoinAndMapMany(
        'spring.meetings',
        Meeting,
        'spring_meeting',
        'spring_meeting."nonClassEventId" = spring.id'
      )
      .leftJoinAndMapOne(
        'p.fall',
        NonClassEventView, 'fall',
        `fall."nonClassParentId" = p."id" AND fall.term = '${TERM.FALL}'`
          + ` AND fall."academicYear" = ${academicYear}`
      )
      .leftJoinAndMapMany(
        'fall.meetings',
        Meeting,
        'fall_meeting',
        'fall_meeting."nonClassEventId" = fall.id'
      )
      .orderBy('area.name', 'ASC')
      .getMany();
  }
}
