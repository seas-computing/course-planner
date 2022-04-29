import {
  BadRequestException,
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
      throw new BadRequestException(
        'Cannot create requested academic year until preceding academic year is created.'
      );
    }
    // Only create the new academic year if it does not yet exist.
    if (!existingYears.includes((newAcademicYear).toString())) {
      let existingFallSemester: Semester;
      let existingSpringSemester: Semester;
      this.logService.info(`Creating academic year ${newAcademicYear}`);
      // Try getting the year previous to the new academic year requested.
      // For example, if we are trying to create the 2026 academic year, use
      // the semesters Spring 2025 and Fall 2024 to construct the new year.
      try {
        existingFallSemester = await this.semesterRepository
          .findOneOrFail({
            where: {
              // NOTE: academic year in database is actually calendar year
              term: TERM.FALL,
              academicYear: newAcademicYear - 2,
            },
            // See: https://github.com/typeorm/typeorm/issues/1270#issuecomment-348429760
            relations: ['absences', 'courseInstances', 'courseInstances.course', 'nonClassEvents'],
          });
      } catch (e) {
        if (e instanceof EntityNotFoundError) {
          throw new BadRequestException(`Cannot find an existing fall ${newAcademicYear - 2} term.`);
        }
        throw e;
      }

      // Get the most recent existing spring semester along with its relations
      try {
        existingSpringSemester = await this.semesterRepository
          .findOneOrFail({
            where: {
              // NOTE: academic year in database is actually the calendar year
              term: TERM.SPRING,
              academicYear: newAcademicYear - 1,
            },
            // See: https://github.com/typeorm/typeorm/issues/1270#issuecomment-348429760
            relations: ['absences', 'courseInstances', 'courseInstances.course', 'nonClassEvents'],
          });
      } catch (e) {
        if (e instanceof EntityNotFoundError) {
          throw new BadRequestException(`Cannot find an existing spring ${newAcademicYear - 1} term.`);
        }
        throw e;
      }

      const fallInstances = existingFallSemester.courseInstances;
      const springInstances = existingSpringSemester.courseInstances;

      // Creates a mapping between the course id and spring instance so that
      // we can access the spring "offered" value while processing fall data.
      // The spring "offered" data is necessary in order to  determine the
      // appropriate "offered" value for the newly created fall semester.
      const courseIdToSpringInstance: Record<string, CourseInstance> = {};
      springInstances.forEach((instance) => {
        courseIdToSpringInstance[instance.course.id] = instance;
      });

      this.logService.info('Creating the fall course instances.');

      const newFallInstances = fallInstances
        .map((fallInstance) => {
          const springInstance: CourseInstance = courseIdToSpringInstance[
            fallInstance.course.id
          ];
          return {
            ...new CourseInstance(),
            offered: springInstance.offered === OFFERED.RETIRED
              ? OFFERED.RETIRED : OFFERED.BLANK,
            course: fallInstance.course,
            facultyCourseInstances: [],
            meetings: [],
          };
        });

      // Create new fall semester
      const fallSemester = new Semester();
      // NOTE: academic year in Semester entity is actually the calendar year
      fallSemester.academicYear = (newAcademicYear - 1).toString();
      fallSemester.term = TERM.FALL;
      fallSemester.courseInstances = newFallInstances;

      this.logService.info('Creating the fall non class events.');

      fallSemester.nonClassEvents = existingFallSemester.nonClassEvents
        .map((nce) => ({
          ...new NonClassEvent(),
          nonClassParent: nce.nonClassParent,
          private: nce.private,
          meetings: [],
        }));

      this.logService.info('Creating the fall absences.');

      fallSemester.absences = existingFallSemester.absences
        .map((absence) => ({
          ...new Absence(),
          faculty: absence.faculty,
        }));

      this.logService.info('Creating the spring course instances, non class events, and absences.');

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

      // Note that this also saves the nested entities because of
      // the cascade set on semester
      this.logService.info('Saving the new fall and spring semesters.');
      await this.semesterRepository.save([fallSemester, springSemester]);

      this.logService.info(`Successfully created academic year ${newAcademicYear}.`);
    }
    this.logService.info(`Academic year ${newAcademicYear} already exists.`);
    return null;
  }

  public onApplicationBootstrap(): void {
    const today = new Date();
    if (today.getMonth() === MONTH.JUN) {
      const yearToAdd = today.getFullYear() + 3;
      try {
        void this.addAcademicYear(yearToAdd);
      } catch (e) {
        this.logService.error(`Failed to add academic year ${yearToAdd}: ${String(e)}`);
      }
    }
  }
}
