import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { TERM } from 'server/semester/semester.entity';
import groupBy from 'lodash.groupby';
import { ConfigService } from 'server/config/config.service';
import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { FacultyScheduleView } from './FacultyScheduleView.entity';
import { FacultyScheduleSemesterView } from './FacultyScheduleSemesterView.entity';
import { FacultyScheduleCourseView } from './FacultyScheduleCourseView.entity';
import { FacultyScheduleAbsenceView } from './FacultyScheduleAbsenceView.entity';
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

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  /**
   * Resolves a list of faculty for the Faculty tab
   * @param acadYears represents an array of years of faculty schedules will be
   * shown. The default value of acadYears is an array of the current academic
   * year calculated in the config service
   */
  public async getAllByYear(
    acadYears: number[] = [this.configService.academicYear]
  ): Promise<{ [key: string]: FacultyResponseDTO[] }> {
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
      .leftJoinAndMapMany(
        'spring.courses',
        FacultyScheduleCourseView,
        'spring_courses',
        'spring_courses."facultyId" = f.id and spring_courses."semesterId" = spring.id'
      )
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
