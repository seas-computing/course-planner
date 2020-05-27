import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { NonClassEvent } from './nonclassevent.entity';
import { Semester } from 'server/semester/semester.entity';
import { TERM } from 'common/constants';

export class NonClassEventService {
  @InjectRepository(NonClassEvent)
  public eventRepository: Repository<NonClassEvent>


  @InjectRepository(NonClassParent)
  public parentRepository: Repository<NonClassParent>


  public async find(academicYear: number = 2019): Promise<any> {
    return this.eventRepository.createQueryBuilder('nce')
      .leftJoin(NonClassParent, 'p', 'p."id" = nce."nonClassParentId"')
      .leftJoinAndMapOne('nce.course', Course, 'c', 'c."id" = p."courseId"')
      .leftJoinAndMapOne('c.area', Area, 'a', 'a."id" = c."areaId"')
      .leftJoinAndMapOne(
        'nce.fall',
        Semester, 'fallSemester',
        'nce."semesterId" = "fallSemester"."id"'
          + ' AND "fallSemester"."academicYear" = :academicYear'
          + ` AND "fallSemester"."term" = '${TERM.FALL}'`,
        { academicYear }
      )
      .leftJoinAndMapOne(
        'nce.spring',
        Semester, 'springSemester',
        'nce."semesterId" = "springSemester"."id"'
          + ' AND "springSemester"."academicYear" = :academicYear'
          + ` AND "springSemester"."term" = '${TERM.SPRING}'`,
        { academicYear: academicYear + 1 }
      )
      .getMany();
  }
}
