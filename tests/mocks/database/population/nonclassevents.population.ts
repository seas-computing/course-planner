import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Course } from 'server/course/course.entity';
import { Semester } from 'server/semester/semester.entity';
import { TERM } from 'common/constants';
import { BasePopulationService } from './base.population';
import { NonClassParentData, NonClassEventData } from './data';

export class NonClassEventPopulationService
  extends BasePopulationService<NonClassEvent> {
  @InjectRepository(Course)
  protected courseRepository: Repository<Course>;

  @InjectRepository(NonClassParent)
  protected parentRepository: Repository<NonClassParent>;

  @InjectRepository(NonClassEvent)
  protected eventRepository: Repository<NonClassEvent>;


  @InjectRepository(Semester)
  protected semesterRepository: Repository<Semester>;

  public async populate({
    parents,
    events,
  }: {
    parents: NonClassParentData[];
    events: NonClassEventData[];
  }): Promise<NonClassEvent[]> {
    const [
      dataScience,
      appliedMath,
    ] = await this.courseRepository.find({
      relations: ['area'],
      where: {
        prefix: In(['AM', 'CS']),
      },
      take: 2,
      order: {
        prefix: 'ASC',
      },
    });

    const [fall, spring] = await this.semesterRepository.find({
      // The usage of an array of objects means typeorm will compile this
      // into
      // ((academicyear = 2019 AND term = "fall") OR  (academicYear = 2020 AND term = "spring"))
      where: [
        { academicYear: 2019, term: TERM.FALL },
        { academicYear: 2020, term: TERM.SPRING },
      ],
      order: {
        academicYear: 'ASC',
      },
    });

    const [
      dataScienceParent,
      appliedMathParent,
    ] = await this.parentRepository.save([
      {
        ...parents[0],
        course: dataScience,
      },
      {
        ...parents[1],
        course: appliedMath,
      },
    ]);

    return this.eventRepository.save([
      {
        ...events[0],
        nonClassParent: dataScienceParent,
        semester: fall,
      },
      {
        ...events[0],
        nonClassParent: dataScienceParent,
        semester: spring,
      },
      {
        ...events[1],
        nonClassParent: appliedMathParent,
        semester: fall,
      },
      {
        ...events[1],
        nonClassParent: appliedMathParent,
        semester: spring,
      },
    ]);
  }

  public async drop() {
    await Promise.all([
      await this.eventRepository.clear(),
      await this.parentRepository.clear(),
    ]);
  }
}
