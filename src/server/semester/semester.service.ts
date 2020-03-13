import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from './semester.entity';

@Injectable()
export class SemesterService {
  @InjectRepository(Semester)
  private readonly semesterRepository: Repository<Semester>

  /**
   * Resolve an array contianing all of the years that currently exist in the
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
}
