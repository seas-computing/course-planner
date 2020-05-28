import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TERM } from 'common/constants';
import { Semester } from './semester.entity';

/**
 * A version of [[Semester]] with a corrected academic year
 * and the calendar year
 */
export interface FullSemester {
  id: string;
  calendarYear: string;
  academicYear: string;
  term: TERM;
}

/**
 * @class SemesterService
 * Injectable service that provides additional methods for querying the
 * database for Semester data.
 */
@Injectable()
export class SemesterService {
  @InjectRepository(Semester)
  private readonly semesterRepository: Repository<Semester>

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
        (results): string[] => results.map(({ year }): string => year)
      );
  }

  /**
   * Retrieve the list of semesters for the given academic years
   * @param academicYears the academic years for which to find semesters
   */
  public async getFullSemesters(academicYears: number[]):
  Promise<FullSemester[]> {
    const semesters = await this.semesterRepository.createQueryBuilder('s')
      .select('semester.id', 'id')
      // Note that academicYear in the semester table is actually calendar year
      // and it comes back as a string because the decimal type
      // is translated to a string by typeorm
      .addSelect(`CASE
        WHEN term = '${TERM.FALL}' THEN semester."academicYear" + 1
        ELSE semester."academicYear"
      END`, 'academicYear')
      .addSelect('academicYear', 'calendarYear')
      .addSelect('semester.term', 'term')
      .from(Semester, 'semester')
      .where('academicYear IN (:...academicYears)', { academicYears })
      // This will order fall semester before spring semester for an academic year
      // since fall has an earlier calendar year
      .orderBy('calendarYear', 'ASC')
      .addOrderBy('academicYear', 'ASC')
      .getRawMany() as unknown[] as FullSemester[];
    return semesters;
  }
}
