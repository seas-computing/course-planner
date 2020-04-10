import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { TERM } from 'server/semester/semester.entity';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { MultiYearPlanView } from 'server/multiYearPlan/MultiYearPlanView.entity';
import { ConfigService } from 'server/config/config.service';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';

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
   * Resolves a list of course instances for the Multi Year Plan
   */

  public async getAllForMultiYearPlan(): Promise<MultiYearPlanResponseDTO[]> {
    // Fetch the current academic year and convert each year to a number
    // so that we can calculate the four year period.
    const academicYear = parseInt(this.configService.academicYear, 10);
    const fourYearList = [0, 1, 2, 3]
      .map((offset): number => offset + academicYear);
    return this.multiYearPlanViewRepository
      .createQueryBuilder('c')
      .where('c.academicYear IN (:...years)', { years: fourYearList })
      .getMany();
  }
}
