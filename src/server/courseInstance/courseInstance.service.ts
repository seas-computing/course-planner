import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { TERM } from 'server/semester/semester.entity';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { ConfigService } from 'server/config/config.service';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import { MultiYearPlanInstanceView } from './MultiYearPlanInstanceView.entity';

/**
 * @class CourseInstanceService
 * Injectable service that provides additional methods for querying the
 * database and handling CRUD operations on Course Instances.
 */

@Injectable()
export class CourseInstanceService {
  @InjectRepository(CourseListingView)
  private readonly courseRepository: Repository<CourseListingView>

  @InjectRepository(MultiYearPlanView)
  private readonly multiYearPlanViewRepository: Repository<MultiYearPlanView>;

  @InjectRepository(MultiYearPlanInstanceView)
  private readonly multiYearPlanInstanceViewRepository:
  Repository<MultiYearPlanInstanceView>;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  /**
   * Resolves a list of courses, which in turn contain sub-lists of instances
   * split up by semesters, with embedded faculty and meetings lists.
   * @param acadYear The academic year for which courses are requested.
   *   Corresponds to the year of the spring semester.
   */

  public async getAllByYear(
    acadYear: number
  ): Promise<CourseInstanceResponseDTO[]> {
    const prevYear = acadYear - 1;

    const courseQuery = this.courseRepository
      .createQueryBuilder('c')
      .leftJoinAndMapOne(
        'c.spring',
        'CourseInstanceListingView',
        'spring',
        `spring."courseId" = c.id AND spring.term = '${TERM.SPRING}'`
      )
      .leftJoinAndMapMany(
        'spring.instructors',
        'FacultyListingView',
        'spring_instructors',
        'spring_instructors."courseInstanceId" = spring.id'
      )
      .leftJoinAndMapMany(
        'spring.meetings',
        'MeetingListingView',
        'spring_meetings',
        '"spring_meetings"."courseInstanceId" = spring.id'
      )
      .leftJoinAndMapOne(
        'spring_meetings.room',
        'RoomListingView',
        'spring_meetings_room',
        '"spring_meetings_room".id = "spring_meetings"."roomId"'
      )
      .leftJoinAndMapOne(
        'c.fall',
        'CourseInstanceListingView',
        'fall',
        `fall."courseId" = c.id AND fall.term = '${TERM.FALL}'`
      )
      .leftJoinAndMapMany(
        'fall.instructors',
        'FacultyListingView',
        'fall_instructors',
        'fall_instructors."courseInstanceId" = fall.id'
      )
      .leftJoinAndMapMany(
        'fall.meetings',
        'MeetingListingView',
        'fall_meetings',
        'fall_meetings."courseInstanceId" = fall.id'
      )
      .leftJoinAndMapOne(
        'fall_meetings.room',
        'RoomListingView',
        'fall_meetings_room',
        'fall_meetings_room.id = fall_meetings."roomId"'
      )
      .where('fall."calendarYear" = :prevYear', { prevYear })
      .andWhere('spring."calendarYear" = :acadYear', { acadYear })
      .orderBy('fall_instructors."instructorOrder"', 'ASC')
      .addOrderBy('spring_instructors."instructorOrder"', 'ASC');

    return courseQuery.getMany() as unknown as CourseInstanceResponseDTO[];
  }

  /**
   * Calculates an array of academic years based on the current year
   */
  public computeAcademicYears(numYears?: number): number[] {
    // If an invalid number of years is provided, use the default number of years
    const defaultNumYears = 4;
    let validatedNumYears: number;
    if (numYears > 0 && Number.isInteger(numYears)) {
      validatedNumYears = numYears;
    } else {
      validatedNumYears = defaultNumYears;
    }
    // Fetch the current academic year and convert each year to a number
    // so that we can calculate the plans for specified or default number of years
    const { academicYear } = this.configService;
    const academicYears = Array.from({ length: validatedNumYears })
      .map((value, index): number => index)
      .map((offset): number => academicYear + offset);
    return academicYears;
  }

  /**
   * Resolves a list of course instances for the Multi Year Plan
   */
  public async getMultiYearPlan(numYears?: number):
  Promise<MultiYearPlanResponseDTO[]> {
    const academicYears = this.computeAcademicYears(numYears);
    return this.multiYearPlanViewRepository
      .createQueryBuilder('c')
      .leftJoinAndMapMany(
        'c.instances',
        MultiYearPlanInstanceView,
        'instances',
        // Note that the second part of this join clause is needed
        // so that the where clause applies to both joins
        'c.id = instances."courseId" AND c."instances_academicYear" = instances."academicYear"'
      )
      // left join to FacultyInstance
      // then left join to Faculty
      .leftJoinAndMapMany(
        'instances.faculty',
        FacultyListingView,
        'instructors',
        'instructors."courseInstanceId" = instances.id'
      )
      // Note that although the academic year in the semester entity is actually
      // the calendar year, c.academicYear is truly the academic year and has
      // been calculated by the MultiYearPlanInstanceView
      .where('c."instances_academicYear" IN (:...academicYears)', { academicYears })
      .orderBy('area', 'ASC')
      .addOrderBy('"catalogNumber"', 'ASC')
      .addOrderBy('instances."instructorOrder"', 'ASC')
      .addOrderBy('instances."displayName"', 'ASC')
      .getMany();
  }
}
