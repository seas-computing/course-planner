import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { NonClassEvent } from './nonclassevent.entity';

export class NonClassEventService {
  @InjectRepository(NonClassParent)
  public parentRepository: Repository<NonClassParent>

  public async find(academicYear: number = 2019): Promise<any> {
    return this.parentRepository.createQueryBuilder('p')
      .leftJoinAndMapOne('p.course', Course, 'c', 'c."id" = p."courseId"')
      .leftJoinAndMapOne('c.area', Area, 'a', 'a."id" = c."areaId"')
      .leftJoinAndMapOne(
        'p.fall',
        NonClassEvent, 'fallEvent',
        '"fallEvent"."nonClassParentId" = p."id"'
      )
      .leftJoinAndMapOne(
        'p.spring',
        NonClassEvent, 'springEvent',
        '"springEvent"."nonClassParentId" = p."id"'
      )
      .getMany();
  }
}
