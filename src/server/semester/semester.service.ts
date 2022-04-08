import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { ABSENCE_TYPE, OFFERED, TERM } from 'common/constants';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseInstanceService } from 'server/courseInstance/courseInstance.service';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Absence } from 'server/absence/absence.entity';
import { Semester } from './semester.entity';

/**
 * @class SemesterService
 * Injectable service that provides additional methods for querying the
 * database for Semester data.
 */
@Injectable()
export class SemesterService {
  @InjectRepository(Semester)
  private readonly semesterRepository: Repository<Semester>;

  @Inject(CourseInstanceService)
  private readonly courseInstanceService: CourseInstanceService;

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
   * faculty absences using the values of the most recent existing
   * spring semester.
   * Retired course instances retain their "retired" status. Meetings and
   * enrollment values are not retained in the new academic year.
   */
  public async addAcademicYear(): Promise<InsertResult> {
    // Get today's date
    const today = new Date();
    // The new academic year should be created by June 1st. This checks that in
    // the month of June that the new academic year has been created.
    if (today.getMonth() === 5) {
      const currentYear = today.getFullYear();
      const newAcademicYear = (currentYear + 1).toString();
      // Note that academicYear in the semester table is actually calendar year
      const existingYears = await this.getYearList();
      // If the new academic year does not yet exist, create the new semesters.
      // E.g. If today is June 2, 2022 and the 2023 academic year does not yet
      // exist, create the 2023 academic year.
      if (!existingYears.includes((currentYear + 1).toString())) {
        const existingFallSemester = await this.semesterRepository
          .findOneOrFail({
            where: {
              // NOTE: academic year in database is actually calendar year
              term: TERM.FALL,
              academicYear: currentYear - 1,
            },
            relations: ['absences', 'nonClassEvents'],
          });

        const existingSpringSemester = await this.semesterRepository
          .findOneOrFail({
            where: {
              // NOTE: academic year in database is actually calendar year
              term: TERM.SPRING,
              academicYear: currentYear,
            },
            relations: ['absences', 'nonClassEvents'],
          });

        // Copy the last-created course instances and clear the instructor,
        // meeting, and enrollment values.
        const existingCourseInstances: CourseInstanceResponseDTO[] = await this
          .courseInstanceService.getAllByYear(currentYear);

        const newCourseInstances: CourseInstance[] = existingCourseInstances
          .map((instance) => ({
            ...new CourseInstance(),
            ...instance,
            offered: instance.spring.offered === OFFERED.RETIRED
              ? OFFERED.RETIRED : OFFERED.BLANK,
            preEnrollment: null,
            studyCardEnrollment: null,
            actualEnrollment: null,
            facultyCourseInstances: [],
            meetings: [],
          }));

        // Create new fall semester
        const fallSemester = new Semester();
        fallSemester.academicYear = newAcademicYear;
        fallSemester.term = TERM.FALL;
        fallSemester.courseInstances = newCourseInstances;

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
            type: ABSENCE_TYPE.PRESENT,
          }));

        await this.semesterRepository.save(fallSemester);

        // Create new spring semester
        const springSemester = new Semester();
        springSemester.academicYear = newAcademicYear;
        springSemester.term = TERM.SPRING;
        springSemester.courseInstances = newCourseInstances;

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
            type: ABSENCE_TYPE.PRESENT,
          }));

        await this.semesterRepository.save(springSemester);
      }
    }
    return null;
  }
}
