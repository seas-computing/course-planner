import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { TERM } from 'server/semester/semester.entity';
import groupBy from 'lodash.groupby';
import { Injectable } from '@nestjs/common';
import { Absence } from 'server/absence/absence.entity';
import { FacultyScheduleView } from './FacultyScheduleView.entity';
import { FacultyScheduleSemesterView } from './FacultyScheduleSemesterView.entity';
import { FacultyScheduleCourseView } from './FacultyScheduleCourseView.entity';
import { Faculty } from './faculty.entity';

/**
 * @class FacultyScheduleService
 * Injectable service that provides additional methods for querying the database
 * on Faculty.
 */
@Injectable()
export class FacultyScheduleService {
  @InjectRepository(FacultyScheduleView)
  private facultyScheduleRepository:
  Repository<FacultyScheduleView>;

  @InjectRepository(Faculty)
  protected facultyEntityRepository: Repository<Faculty>;

  /**
   * Resolves a list of faculty for the Faculty tab
   * @param acadYears represents an array of years of faculty schedules will be
   * shown. If no values were supplied for acadYears, all data for the
   * existing valid academic years will be returned.
   */
  public async getAllByYear(acadYears: number[]):
  Promise<{ [key: string]: FacultyResponseDTO[] }> {
    // Prevent SQL error in the case where acadYears array is invalid
    if (acadYears.length === 0) {
      return {};
    }
    const results = await this.facultyScheduleRepository
      .createQueryBuilder('f')
      .leftJoinAndMapOne(
        'f.fall',
        FacultyScheduleSemesterView,
        'fall',
        `fall.term = '${TERM.FALL}'`
      )
      .leftJoinAndMapMany(
        'fall.courses',
        FacultyScheduleCourseView,
        'fall_courses',
        'fall_courses."facultyId" = f.id and fall_courses."semesterId" = fall.id'
      )
      .leftJoinAndMapOne(
        'fall.absence',
        Absence,
        'fall_absence',
        'fall_absence."facultyId" = f.id and fall_absence."semesterId" = fall.id'
      )
      .leftJoinAndMapOne(
        'f.spring',
        FacultyScheduleSemesterView,
        'spring',
        `spring.term = '${TERM.SPRING}'`
      )
      .leftJoinAndMapMany(
        'spring.courses',
        FacultyScheduleCourseView,
        'spring_courses',
        'spring_courses."facultyId" = f.id and spring_courses."semesterId" = spring.id'
      )
      .leftJoinAndMapOne(
        'spring.absence',
        Absence,
        'spring_absence',
        'spring_absence."facultyId" = f.id and spring_absence."semesterId" = spring.id'
      )
      .where('fall.academicYear IN (:...acadYears)', { acadYears })
      .andWhere('spring.academicYear IN (:...acadYears)', { acadYears })
      .orderBy('f.area', 'ASC')
      .addOrderBy('f."lastName"', 'ASC')
      .addOrderBy('f."firstName"', 'ASC')
      .getMany() as FacultyResponseDTO[];
    return groupBy(results, (result): number => result.fall.academicYear);
  }
}
