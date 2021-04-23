import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Semester } from 'server/semester/semester.entity';
import { TERM } from 'common/constants';
import { Meeting } from 'server/meeting/meeting.entity';
import { BasePopulationService } from './base.population';
import { NonClassParentData, NonClassEventData } from './data';

export class NonClassEventPopulationService
  extends BasePopulationService<NonClassEvent> {
  @InjectRepository(NonClassEvent)
  protected eventRepository: Repository<NonClassEvent>;

  @InjectRepository(NonClassParent)
  protected parentRepository: Repository<NonClassParent>;

  @InjectRepository(Semester)
  protected semesterRepository: Repository<Semester>;

  @InjectRepository(Meeting)
  protected meetingRepository: Repository<Meeting>;

  public async populate({
    parents,
    events,
  }: {
    parents: NonClassParentData[];
    events: NonClassEventData[];
  }): Promise<NonClassEvent[]> {
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
      },
      {
        ...parents[1],
      },
    ]);

    const meetings = await this.meetingRepository.find({
      take: 4,
    });
    return this.eventRepository.save([
      {
        ...events[0],
        nonClassParent: dataScienceParent,
        semester: fall,
        meetings: [meetings[0]],
      },
      {
        ...events[0],
        nonClassParent: dataScienceParent,
        semester: spring,
        meetings: [meetings[1]],
      },
      {
        ...events[1],
        nonClassParent: appliedMathParent,
        semester: fall,
        meetings: [meetings[2]],
      },
      {
        ...events[1],
        nonClassParent: appliedMathParent,
        semester: spring,
        meetings: [meetings[3]],
      },
    ]);
  }

  public async drop(): Promise<void> {
    // Using code found here: https://github.com/typeorm/typeorm/issues/5934#issuecomment-618334924
    // to get the table name dynamically, since the spacing/casing is a little weird
    const nonClassEvent = this.eventRepository.metadata.tableName;
    const nonClassParent = this.parentRepository.metadata.tableName;
    await this.eventRepository.query(`TRUNCATE TABLE "${nonClassEvent}", "${nonClassParent}" CASCADE;`);
  }
}
