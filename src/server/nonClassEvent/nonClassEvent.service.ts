import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { TERM } from 'common/constants';
import { NonClassParentView } from './NonClassParentView.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';

export class NonClassEventService {
  @InjectRepository(NonClassParentView)
  public parentRepository: Repository<NonClassParentView>;

  public async find(): Promise<NonClassParentView[]> {
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
        NonClassEventView,
        'spring',
        `spring."nonClassParentId" = p.id AND spring.term = '${TERM.SPRING}'`
      )
      .leftJoinAndMapOne(
        'p.fall',
        NonClassEventView,
        'fall',
        `fall."nonClassParentId" = p.id AND fall.term = '${TERM.FALL}'`
      )
      .orderBy('area.name', 'ASC')
      .getMany();
  }
}
