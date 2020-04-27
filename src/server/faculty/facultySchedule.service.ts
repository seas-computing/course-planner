import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { TERM } from 'server/semester/semester.entity';
import groupBy from 'lodash.groupby';
import { Faculty } from './faculty.entity';
import { FacultyScheduleView } from './FacultyScheduleView.entity';
import { FacultyScheduleSemesterView } from './FacultyScheduleSemesterView.entity';
import { FacultyScheduleCourseView } from './FacultyScheduleCourseView.entity';
import { FacultyScheduleAbsenceView } from './FacultyScheduleAbsenceView.entity';

/**
 * @class FacultyScheduleService
 * Injectable service that provides additional methods for querying the database
 * on Faculty.
 */
export class FacultyScheduleService {
  @InjectRepository(FacultyScheduleView)
  private readonly facultyScheduleRepository:
  Repository<FacultyScheduleView>;

  @InjectRepository(FacultyScheduleSemesterView)
  private readonly facultyScheduleSemesterRepository:
  Repository<FacultyScheduleSemesterView>;

  @InjectRepository(FacultyScheduleCourseView)
  private readonly facultyScheduleCourseRepository:
  Repository<FacultyScheduleCourseView>;

  @InjectRepository(FacultyScheduleAbsenceView)
  private readonly facultyScheduleAbsenceRepository:
  Repository<FacultyScheduleAbsenceView>;

  /**
   * Resolves a list of faculty for the Faculty tab
   */
  public async getAllFaculty(acadYears: number[]):
  Promise<{ [key: string]: FacultyResponseDTO[] }> {
    const results = await this.facultyScheduleRepository
      .createQueryBuilder('f')
      .leftJoinAndMapOne(
        'f.fall',
        FacultyScheduleSemesterView,
        'fall',
        `fall.term = '${TERM.FALL}'`
      )
      // setting dto.fall.courses
      .leftJoinAndMapMany(
        'fall.courses',
        FacultyScheduleCourseView,
        'fall_courses',
        'fall_courses."facultyId" = f.id and fall_courses."semesterId" = fall.id'
      )
      // setting dto.fall.absence
      .leftJoinAndMapOne(
        'fall.absence',
        FacultyScheduleAbsenceView,
        'fall_absence',
        'fall_absence."facultyId" = f.id and fall_absence."semesterId" = fall.id'
      )
      .leftJoinAndMapOne(
        'f.spring',
        FacultyScheduleSemesterView,
        'spring',
        `spring.term = '${TERM.SPRING}'`
      )
      // setting dto.spring.courses
      .leftJoinAndMapMany(
        'spring.courses',
        FacultyScheduleCourseView,
        'spring_courses',
        'spring_courses."facultyId" = f.id and spring_courses."semesterId" = spring.id'
      )
      // setting dto.spring.absence
      .leftJoinAndMapOne(
        'spring.absence',
        FacultyScheduleAbsenceView,
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
