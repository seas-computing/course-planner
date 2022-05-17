import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { OFFERED, TERM } from 'common/constants';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Absence } from 'server/absence/absence.entity';
import { MONTH } from 'common/constants/month';
import { LogService } from 'server/log/log.service';
import { Semester } from './semester.entity';

/**
 * @class SemesterService
 * Injectable service that provides additional methods for querying the
 * database for Semester data.
 */
@Injectable()
export class SemesterService implements OnApplicationBootstrap {
  @InjectRepository(Semester)
  private readonly semesterRepository: Repository<Semester>;

  @InjectRepository(CourseInstance)
  private readonly ciRepository: Repository<CourseInstance>;

  @InjectRepository(Absence)
  private readonly absenceRepository: Repository<Absence>;

  @InjectRepository(NonClassEvent)
  private readonly nceRepository: Repository<NonClassEvent>;

  @Inject(LogService)
  private readonly logService: LogService;

  /**
   * Resolves to an array containing all of the years that currently exist in the
   * database, as strings
   */
  public async getYearList(): Promise<string[]> {
    return this.semesterRepository
      .createQueryBuilder('sem')
      .select('sem.academicYear', 'year')
      .distinct(true)
      .orderBy('year', 'ASC')
      .getRawMany()
      .then(
        // raw result is array of e.g. { year: '2020'} so we need to map
        (results): string[] => results.map(
          ({ year }: { year: string}): string => year
        )
      );
  }

  /**
   * Resolve an array containing all semesters that currently exist in the
   * database, as strings
   */
  public async getSemesterList(): Promise<string[]> {
    return this.semesterRepository
      .createQueryBuilder('sem')
      .select('sem.term', 'term')
      .addSelect('sem."academicYear"', 'year')
      .addSelect(`CASE
      WHEN term = '${TERM.SPRING}' THEN 1
      WHEN term = '${TERM.FALL}' THEN 2
      ELSE 3
    END`, 'termOrder')
      .distinct(true)
      .orderBy('year', 'ASC')
      .addOrderBy('"termOrder"', 'ASC')
      .getRawMany()
      .then(
        // raw result is array, so we need to map to get the desired format (e.g. 'FALL 2021')
        (results): string[] => results.map(
          ({ term, year }: {term: TERM, year: string}): string => `${term} ${year}`
        )

      );
  }

  /**
   * Creates a new academic year of course instances, non class events, and
   * faculty absences using the values of the previous semester.
   * Retired course instances retain their "retired" status. Meetings and
   * enrollment values are not retained in the newly created academic year.
   */
  public async addAcademicYear(newAcademicYear: number): Promise<void> {
    // Note that academicYear in the semester table is actually calendar year.
    const existingYears = await this.getYearList();
    // If the academic year previous to the newAcademicYear does not exist,
    // throw an exception.
    if (!existingYears.includes((newAcademicYear - 1).toString())) {
      throw new Error(
        'Cannot create requested academic year until preceding academic year is created.'
      );
    }
    // Only create the new academic year if it does not yet exist.
    if (!existingYears.includes((newAcademicYear).toString())) {
      let existingSpringSemester: Semester;
      let existingSpringCourseInstances: CourseInstance[];
      let existingSpringAbsences: Absence[];
      let existingSpringNonClassEvents: NonClassEvent[];

      this.logService.info(`Creating academic year ${newAcademicYear}`);

      // Get the most recent existing spring semester along with its relations
      try {
        existingSpringSemester = await this.semesterRepository
          .findOneOrFail({
            where: {
              // NOTE: academic year in database is actually the calendar year
              term: TERM.SPRING,
              academicYear: newAcademicYear - 1,
            },
          });
      } catch (e) {
        if (e instanceof EntityNotFoundError) {
          throw new Error(`Cannot find an existing spring ${newAcademicYear - 1} term.`);
        }
        throw e;
      }

      // Get existing spring course instances
      try {
        existingSpringCourseInstances = await this.ciRepository
          .find({
            where: {
              semester: existingSpringSemester,
            },
            relations: ['course'],
            loadRelationIds: true,
          });
      } catch (e) {
        if (e instanceof EntityNotFoundError) {
          throw new Error(`Cannot find course instances associated with Spring ${newAcademicYear - 1}.`);
        }
        throw e;
      }

      // Get existing spring non class events
      try {
        existingSpringNonClassEvents = await this.nceRepository
          .find({
            where: {
              semester: existingSpringSemester,
            },
          });
      } catch (e) {
        if (e instanceof EntityNotFoundError) {
          throw new Error(`Cannot find non class events associated with Spring ${newAcademicYear - 1}.`);
        }
        throw e;
      }

      // Get existing spring absences
      try {
        existingSpringAbsences = await this.absenceRepository
          .find({
            where: {
              semester: existingSpringSemester,
            },
          });
      } catch (e) {
        if (e instanceof EntityNotFoundError) {
          throw new Error(`Cannot find absences associated with Spring ${newAcademicYear - 1}.`);
        }
        throw e;
      }

      this.logService.verbose('Creating the fall course instances.');

      const newFallInstances = existingSpringCourseInstances
        .map((springInstance) => ({
          ...new CourseInstance(),
          offered: springInstance.offered === OFFERED.RETIRED
            ? OFFERED.RETIRED : OFFERED.BLANK,
          course: springInstance.course,
          facultyCourseInstances: [],
          meetings: [],
        }));

      // Create new fall semester
      const fallSemester = new Semester();
      // NOTE: academic year in Semester entity is actually the calendar year
      fallSemester.academicYear = (newAcademicYear - 1).toString();
      fallSemester.term = TERM.FALL;
      fallSemester.courseInstances = newFallInstances;

      this.logService.verbose(`Created ${fallSemester.courseInstances.length} fall course instances.`);
      this.logService.debug(fallSemester.courseInstances);

      this.logService.verbose('Creating the fall non-class events.');

      fallSemester.nonClassEvents = existingSpringNonClassEvents
        .map((nce) => ({
          ...new NonClassEvent(),
          nonClassParent: nce.nonClassParent,
          private: nce.private,
          meetings: [],
        }));

      this.logService.verbose(`Created ${fallSemester.nonClassEvents.length} fall non-class events.`);
      this.logService.debug(fallSemester.nonClassEvents);

      this.logService.verbose('Creating the fall absences.');

      fallSemester.absences = existingSpringAbsences
        .map((absence) => ({
          ...new Absence(),
          faculty: absence.faculty,
        }));

      this.logService.verbose(`Created ${fallSemester.absences.length} fall absences.`);
      this.logService.debug(fallSemester.absences);

      this.logService.verbose('Creating the spring course instances.');
      this.logService.verbose('Creating the spring non-class events.');
      this.logService.verbose('Creating the spring absences.');

      // Create new spring semester
      const springSemester = {
        ...fallSemester,
        courseInstances: fallSemester.courseInstances.map(
          (instance) => ({ ...instance })
        ),
        nonClassEvents: fallSemester.nonClassEvents.map(
          (event) => ({ ...event })
        ),
        absences: fallSemester.courseInstances.map(
          (absence) => ({ ...absence })
        ),
        academicYear: newAcademicYear.toString(),
        term: TERM.SPRING,
      };

      this.logService.verbose(`Created ${springSemester.courseInstances.length} spring course instances.`);
      this.logService.debug(springSemester.courseInstances);
      this.logService.verbose(`Created ${springSemester.nonClassEvents.length} spring non-class events.`);
      this.logService.debug(springSemester.nonClassEvents);
      this.logService.verbose(`Created ${springSemester.absences.length} spring absences.`);
      this.logService.debug(springSemester.absences);

      // Note that this also saves the nested entities because of
      // the cascade set on semester
      await this.semesterRepository.save([fallSemester, springSemester]);

      this.logService.info(`Successfully created academic year ${newAcademicYear}.`);
    }
    this.logService.info(`Academic year ${newAcademicYear} already exists.`);
    return null;
  }

  public onApplicationBootstrap(): Promise<void> {
    const today = new Date();
    if (today.getMonth() === MONTH.JUN) {
      const yearToAdd = today.getFullYear() + 4;
      try {
        return this.addAcademicYear(yearToAdd);
      } catch (e) {
        this.logService.error(e);
      }
    }
  }
}
