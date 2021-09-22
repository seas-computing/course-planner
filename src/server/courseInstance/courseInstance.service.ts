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
import { FacultyCourseInstance } from './facultycourseinstance.entity';
import { Faculty } from '../faculty/faculty.entity';
import { CourseInstance } from './courseinstance.entity';
import { InstructorRequestDTO } from '../../common/dto/courses/InstructorRequest.dto';
import { InstructorResponseDTO } from '../../common/dto/courses/InstructorResponse.dto';

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

  @InjectRepository(CourseInstance)
  private readonly courseInstanceRepository: Repository<CourseInstance>;

  @InjectRepository(Faculty)
  private readonly facultyRepository: Repository<Faculty>;

  @InjectRepository(FacultyCourseInstance)
  private readonly instructorRepository: Repository<FacultyCourseInstance>;

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
      .leftJoin(Course, 'course', 'course.id=c.id')
      .where('fall."calendarYear" = :prevYear', { prevYear })
      .andWhere('spring."calendarYear" = :acadYear', { acadYear })
      .orderBy('area', 'ASC')
      .addOrderBy('course.prefix', 'ASC')
      .addOrderBy('course."numberInteger"', 'ASC')
      .addOrderBy('course."numberAlphabetical"', 'ASC')
      .addOrderBy('fall_instructors."instructorOrder"', 'ASC')
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

  /**
   * Accepts a list of instructorIds and a courseInstanceId, assigns the
   * faculty in the order they appear in the array, then returns the instructor
   * data formatted for display
   */
  public async assignInstructors(
    courseInstanceId: string,
    instructors: InstructorRequestDTO[]
  ): Promise<InstructorResponseDTO[]> {
    // Pull the instructors from the database to ensure that they actually
    // exist. Using .map() instead of .findByIds() to ensure order is unchanged
    const dbInstructors = await Promise.all(
      instructors.map(
        ({ id }) => this.facultyRepository.findOneOrFail(id)
      )
    );
    const courseInstance = await this.courseInstanceRepository
      .findOneOrFail(courseInstanceId);
    const updates = dbInstructors.map(
      (faculty, order): FacultyCourseInstance => (
        this.instructorRepository.create({
          courseInstance,
          faculty,
          order,
        }))
    );

    // Adding the list of updates to the course isntances, instead of saving
    // them directly, to ensure that the new list of instructors replaces the
    // old one.
    const instructorUpdate = await this.courseInstanceRepository.save(
      {
        ...courseInstance,
        facultyCourseInstances: updates,
      }
    );
    if (instructorUpdate) {
      return instructorUpdate
        .facultyCourseInstances
        .map(({ faculty, order }) => ({
          id: faculty.id,
          notes: faculty.notes,
          displayName: `${faculty.lastName}, ${faculty.firstName}`,
          order,
        }));
    }
    throw new Error('Unable to update instructor list');
  }
}
