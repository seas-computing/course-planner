import { BadRequestException, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OFFERED, TERM } from 'common/constants';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Absence } from 'server/absence/absence.entity';
import { MONTH } from 'common/constants/month';
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
      // Try getting the year previous to the new academic year requested.
      // For example, if we are trying to create the 2026 academic year, use
      // the semesters Spring 2025 and Fall 2024 to construct the new year.
      const existingFallSemester = await this.semesterRepository
        .findOneOrFail({
          where: {
            // NOTE: academic year in database is actually calendar year
            term: TERM.FALL,
            academicYear: newAcademicYear - 2,
          },
          // See: https://github.com/typeorm/typeorm/issues/1270#issuecomment-348429760
          relations: ['absences', 'courseInstances', 'courseInstances.course', 'nonClassEvents'],
        });

      // Get the most recent existing spring semester along with its relations
      const existingSpringSemester = await this.semesterRepository
        .findOneOrFail({
          where: {
            // NOTE: academic year in database is actually the calendar year
            term: TERM.SPRING,
            academicYear: newAcademicYear - 1,
          },
          // See: https://github.com/typeorm/typeorm/issues/1270#issuecomment-348429760
          relations: ['absences', 'courseInstances', 'courseInstances.course', 'nonClassEvents'],
        });

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

      fallSemester.nonClassEvents = existingFallSemester.nonClassEvents
        .map((nce) => ({
          ...new NonClassEvent(),
          nonClassParent: nce.nonClassParent,
          private: nce.private,
          meetings: [],
        }));

      fallSemester.absences = existingFallSemester.absences
        .map((absence) => ({
          ...new Absence(),
          faculty: absence.faculty,
        }));

      const newSpringInstances = springInstances
        .map((springInstance) => ({
          ...new CourseInstance(),
          offered: springInstance.offered === OFFERED.RETIRED
            ? OFFERED.RETIRED : OFFERED.BLANK,
          course: springInstance.course,
          facultyCourseInstances: [],
          meetings: [],
        }));

      // Create new spring semester
      const springSemester = new Semester();
      springSemester.academicYear = newAcademicYear.toString();
      springSemester.term = TERM.SPRING;
      springSemester.courseInstances = newSpringInstances;

      springSemester.nonClassEvents = existingSpringSemester.nonClassEvents
        .map((nce) => ({
          ...new NonClassEvent(),
          nonClassParent: nce.nonClassParent,
          private: nce.private,
          meetings: [],
        }));

      springSemester.absences = existingSpringSemester.absences
        .map((absence) => ({
          ...new Absence(),
          faculty: absence.faculty,
        }));

      // Note that this also saves the nested entities because of
      // the cascade set on semester
      await this.semesterRepository.save([fallSemester, springSemester]);
    }
    return null;
  }

  public async onApplicationBootstrap(): Promise<void> {
    const today = new Date();
    if (today.getMonth() === MONTH.JUN) {
      await this.addAcademicYear(today.getFullYear() + 3);
    }
  }
}
