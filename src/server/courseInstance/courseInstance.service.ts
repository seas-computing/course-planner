import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { Course } from 'server/course/course.entity';
import { TERM } from 'common/constants';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import { MultiYearPlanInstanceView } from './MultiYearPlanInstanceView.entity';
import { ScheduleViewResponseDTO } from '../../common/dto/schedule/schedule.dto';
import { ScheduleBlockView } from './ScheduleBlockView.entity';

/**
 * @class CourseInstanceService
 * Injectable service that provides additional methods for querying the
 * database and handling CRUD operations on Course Instances.
 */

@Injectable()
export class CourseInstanceService {
  @InjectRepository(CourseListingView)
  private readonly courseRepository: Repository<CourseListingView>;

  @InjectRepository(MultiYearPlanView)
  private readonly multiYearPlanViewRepository: Repository<MultiYearPlanView>;

  @InjectRepository(Course)
  protected courseEntityRepository: Repository<Course>;

  @InjectRepository(ScheduleBlockView)
  private readonly courseScheduleRepository: Repository<ScheduleBlockView>;

  /**
   * Resolves a list of courses, which in turn contain sub-lists of instances
   * split up by semesters, with embedded faculty and meetings lists.
   * @param acadYear The academic year for which courses are requested.
   *   Corresponds to the year of the spring semester.
   */

  public getAllByYear(
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

    return courseQuery.getMany() as Promise<CourseInstanceResponseDTO[]>;
  }

  /**
   * Resolves a list of course instances for the Multi Year Plan
   */
  public async getMultiYearPlan(academicYears: number[]):
  Promise<MultiYearPlanResponseDTO[]> {
    return await this.multiYearPlanViewRepository
      .createQueryBuilder('c')
      .leftJoinAndMapMany(
        'c.semesters',
        SemesterView,
        's',
        // get all the semesters filtered by the WHERE clause below
        's.id = s.id'
      )
      .leftJoinAndMapOne(
        's.instance',
        MultiYearPlanInstanceView,
        'ci',
        'c.id = ci."courseId" AND s.id = ci."semesterId"'
      )
      .leftJoinAndMapMany(
        'ci.faculty',
        FacultyListingView,
        'instructors',
        'instructors."courseInstanceId" = ci.id'
      )
      // Note that although the academic year in the semester entity is actually
      // the calendar year, academicYear is truly the academic year and has
      // been calculated by the SemesterView
      .where('s."academicYear" IN (:...academicYears)', { academicYears })
      .orderBy('"catalogPrefix"', 'ASC')
      .addOrderBy('"catalogNumber"', 'ASC')
      .addOrderBy('s."academicYear"', 'ASC')
      .addOrderBy('s."termOrder"', 'ASC')
      .addOrderBy('instructors."instructorOrder"', 'ASC')
      .addOrderBy('instructors."displayName"', 'ASC')
      .getMany() as MultiYearPlanResponseDTO[];
  }

  /**
   * Generates the data for the schedule view in the front-end app
   */
  public async getCourseSchedule(
    term: TERM, calendarYear: string
  ): Promise<ScheduleViewResponseDTO[]> {
    return this.courseScheduleRepository
      .createQueryBuilder('block')
      .leftJoinAndMapMany(
        'block.courses',
        'ScheduleEntryView',
        'entry',
        'block.id=entry."blockId"'
      )
      .where('block.term = :term', { term })
      .andWhere('block."calendarYear" = :calendarYear', { calendarYear })
      .orderBy('weekday', 'ASC')
      .addOrderBy('"startHour"', 'ASC')
      .addOrderBy('"startMinute"', 'ASC')
      .addOrderBy('duration', 'ASC')
      .addOrderBy('"coursePrefix"', 'ASC')
      .addOrderBy('"courseNumber"', 'ASC')
      .getMany() as Promise<ScheduleViewResponseDTO[]>;
  }
}
