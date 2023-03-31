import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { Course } from 'server/course/course.entity';
import { OFFERED, TERM } from 'common/constants';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import CourseInstanceUpdateDTO from 'common/dto/courses/CourseInstanceUpdate.dto';
import { ConfigService } from 'server/config/config.service';
import { getFutureTerms } from 'common/utils/termHelperFunctions';
import { RoomScheduleResponseDTO } from 'common/dto/schedule/roomSchedule.dto';
import { MultiYearPlanInstanceView } from './MultiYearPlanInstanceView.entity';
import { ScheduleViewResponseDTO } from '../../common/dto/schedule/schedule.dto';
import { ScheduleBlockView } from './ScheduleBlockView.entity';
import { FacultyCourseInstance } from './facultycourseinstance.entity';
import { Faculty } from '../faculty/faculty.entity';
import { CourseInstance } from './courseinstance.entity';
import { InstructorRequestDTO } from '../../common/dto/courses/InstructorRequest.dto';
import { InstructorResponseDTO } from '../../common/dto/courses/InstructorResponse.dto';
import { CourseInstanceListingView } from './CourseInstanceListingView.entity';
import { RoomScheduleBlockView } from './RoomScheduleBlockView.entity';

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

  @InjectRepository(CourseInstanceListingView)
  private readonly instanceRepository: Repository<CourseInstanceListingView>;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @InjectRepository(SemesterView)
  private readonly semesterRepository: Repository<SemesterView>;

  @InjectRepository(RoomScheduleBlockView)
  private readonly roomScheduleRepository: Repository<RoomScheduleBlockView>;

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
        `spring."courseId" = COALESCE(c."sameAsId", c.id) AND spring.term = '${TERM.SPRING}'`
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
        `fall."courseId" = COALESCE(c."sameAsId", c.id) AND fall.term = '${TERM.FALL}'`
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
      .addOrderBy('spring_instructors."instructorOrder"', 'ASC')
      .addOrderBy('fall_meetings.day', 'ASC')
      .addOrderBy('fall_meetings.startTime', 'ASC')
      .addOrderBy('fall_meetings.endTime', 'ASC')
      .addOrderBy('spring_meetings.day', 'ASC')
      .addOrderBy('spring_meetings.startTime', 'ASC')
      .addOrderBy('spring_meetings.endTime', 'ASC');

      console.log("coursequery",courseQuery.printSql())
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
        'ci."courseId" = COALESCE(c."sameAsId", c.id) AND s.id = ci."semesterId"'
      )
      .leftJoinAndMapMany(
        'ci.faculty',
        FacultyListingView,
        'instructors',
        'instructors."courseInstanceId" = ci.id'
      )
      .leftJoin(Course, 'course', 'course.id=c.id')
      // Note that although the academic year in the semester entity is actually
      // the calendar year, academicYear is truly the academic year and has
      // been calculated by the SemesterView
      .where('s."academicYear" IN (:...academicYears)', { academicYears })
      .orderBy('"catalogPrefix"', 'ASC')
      .addOrderBy('course."numberInteger"', 'ASC')
      .addOrderBy('course."numberAlphabetical"', 'ASC')
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
    return instructorUpdate
      .facultyCourseInstances
      .map(({ faculty, order }) => ({
        id: faculty.id,
        notes: faculty.notes,
        displayName: `${faculty.lastName}, ${faculty.firstName}`,
        order,
      }));
  }

  public async editCourseInstance(
    instanceId: string,
    update: CourseInstanceUpdateDTO
  ): Promise<CourseInstanceUpdateDTO> {
    const courseInstance = await this.courseInstanceRepository
      .findOneOrFail(instanceId, { relations: ['course', 'semester'] });
    // The academicYear property of Semester entity is actually the calendar year
    const editedAcademicYear = parseInt(
      courseInstance.semester.academicYear, 10
    ) + (courseInstance.semester.term === TERM.FALL ? 1 : 0);
    const futureTerms = getFutureTerms(courseInstance.semester.term);
    let subqueryWhereClause = 's."academicYear" > :editedAcademicYear::int';
    // Prevent SQL error on empty IN clause
    // (If there are no future terms after this term in the same academic year,
    // then no purpose in having this second portion of the where clause.)
    if (futureTerms.length > 0) {
      subqueryWhereClause += ' or (s."academicYear" = :editedAcademicYear and s.term IN (:...futureTerms))';
    }
    const courseId = courseInstance.course.id;
    const whereClause = '("courseId" = :courseId) AND "semesterId" IN (' + this.semesterRepository.createQueryBuilder('s')
      .select('s.id').where(subqueryWhereClause).getQuery() + ')';
    // If the user marks a course instance as retired, throw an error if it is
    // a course instance of a past academic year. If not, mark the semester
    // being updated and future semesters with the offered value of "Retired"
    if (update.offered === OFFERED.RETIRED) {
      if (editedAcademicYear < this.configService.academicYear) {
        throw new BadRequestException(
          'Cannot retire courses of past academic years.'
        );
      }
      await this.courseInstanceRepository
        .createQueryBuilder()
        .update(CourseInstance)
        .set({ offered: OFFERED.RETIRED })
        .where(whereClause,
          { courseId, editedAcademicYear, futureTerms })
        .execute();
    }
    // If the course instance being updated was originally "retired" in the
    // database, allow that instance to be updated to the new offered value and
    // update the future course instances to OFFERED.BLANK only if we are updating
    // a current or future academic year instance.
    // The second part of the condition prevents an instance that was originally
    // retired from also retiring later instances if the user opens the modal of
    // the retired course, does not alter the offered value, and clicks save again.
    if (courseInstance.offered === OFFERED.RETIRED
      && update.offered !== OFFERED.RETIRED) {
      // if it is a past instance from a previous academic year, throw error
      if (editedAcademicYear < this.configService.academicYear) {
        throw new BadRequestException(
          'Cannot unretire courses of past academic years.'
        );
      } else {
        // Update the future existing semesters with OFFERED.BLANK
        await this.courseInstanceRepository
          .createQueryBuilder()
          .update(CourseInstance)
          .set({ offered: OFFERED.BLANK })
          .where(whereClause,
            { courseId, editedAcademicYear, futureTerms })
          .execute();
      }
    }
    const updatedInstance = await this.courseInstanceRepository.save(
      {
        ...courseInstance,
        ...update,
      }
    );
    // get the updated fields in case any changes were made on save
    const {
      offered, preEnrollment, studyCardEnrollment, actualEnrollment,
    } = updatedInstance;
    return {
      offered, preEnrollment, studyCardEnrollment, actualEnrollment,
    };
  }

  public async getRoomSchedule(
    roomId: string,
    term: TERM,
    calendarYear: string
  ): Promise<RoomScheduleResponseDTO[]> {
    return this.roomScheduleRepository
      .createQueryBuilder('block')
      .leftJoinAndMapMany(
        'block.faculty',
        FacultyListingView,
        'instructors',
        'instructors."courseInstanceId" = block."courseInstanceId"'
      )
      .where('block."roomId" = :roomId', { roomId })
      .andWhere('block.term = :term', { term })
      .andWhere('block."calendarYear" = :calendarYear', { calendarYear })
      .orderBy('weekday', 'ASC')
      .addOrderBy('"startHour"', 'ASC')
      .addOrderBy('"startMinute"', 'ASC')
      .addOrderBy('instructors."instructorOrder"', 'ASC')
      .getMany() as Promise<RoomScheduleResponseDTO[]>;
  }
}
