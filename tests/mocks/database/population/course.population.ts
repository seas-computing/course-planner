import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { Course } from 'server/course/course.entity';
import { Semester } from 'server/semester/semester.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'server/location/room.entity';
import { Area } from 'server/area/area.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { TERM_PATTERN, OFFERED, TERM } from 'common/constants';
import { Meeting } from 'server/meeting/meeting.entity';
import { BasePopulationService } from './base.population';
import { CourseData } from './data';

/**
 * Populates the Courses, Course Intances, and Meetings tables in the database
 */
export class CoursePopulationService
  extends BasePopulationService<Course> {
  @InjectRepository(Course)
  protected repository: Repository<Course>;

  @InjectRepository(Semester)
  protected semesterRepository: Repository<Semester>;

  @InjectRepository(Room)
  protected roomRepository: Repository<Room>;

  @InjectRepository(Area)
  protected areaRepository: Repository<Area>;

  @InjectRepository(Faculty)
  protected facultyRepository: Repository<Faculty>;

  public async populate(
    { courses }: { courses: CourseData[] }
  ): Promise<Course[]> {
    const allAreas = await this.areaRepository.find(
      {
        order: {
          name: 'ASC',
        },
      }
    );

    const allFaculty = await this.facultyRepository.find(
      {
        order: {
          HUID: 'ASC',
        },
      }
    );

    const allRooms = await this.roomRepository.find(
      {
        order: {
          name: 'ASC',
        },
        relations: ['building'],
      }
    );
    const allSemesters = await this.semesterRepository.find(
      {
        order: {
          academicYear: 'ASC',
          term: 'ASC',
        },
      }
    );
    const savedCourses = await this.repository.save(
      courses.map((courseData): Course => {
        const course = new Course();
        course.title = courseData.title;
        course.prefix = courseData.prefix;
        course.number = courseData.number;
        course.isUndergraduate = courseData.isUndergraduate;
        course.notes = courseData.notes;
        course.private = courseData.private;
        course.isSEAS = courseData.isSEAS;
        course.termPattern = courseData.termPattern;
        course.area = allAreas.find(
          ({ name }): boolean => name === courseData.area
        );
        course.instances = allSemesters.map((sem): CourseInstance => {
          const instance = new CourseInstance();
          instance.semester = sem;
          if (
            courseData.termPattern === TERM_PATTERN.BOTH
            || (sem.term === TERM.SPRING
              && courseData.termPattern === TERM_PATTERN.SPRING)
            || (sem.term === TERM.FALL
              && courseData.termPattern === TERM_PATTERN.FALL)
          ) {
            instance.facultyCourseInstances = courseData
              .instances
              .facultyHUIDs
              .map((huid, order): FacultyCourseInstance => {
                const fci = new FacultyCourseInstance();
                fci.order = order;
                fci.faculty = allFaculty.find(
                  ({ HUID }) => HUID === huid
                );
                return fci;
              });
            instance.meetings = courseData
              .instances
              .meetings
              .map((meetingData): Meeting => {
                const meeting = new Meeting();
                meeting.startTime = meetingData.startTime;
                meeting.endTime = meetingData.endTime;
                meeting.day = meetingData.day;
                meeting.room = allRooms.find(
                  ({ name, building }): boolean => (
                    `${building.name} ${name}` === meetingData.room
                  )
                );
                return meeting;
              });
            instance.offered = instance.meetings.length > 0
              ? OFFERED.Y : OFFERED.RETIRED;
          }
          return instance;
        });
        return course;
      })
    );
    // Populate the sameAs relationships after we've created all the courses
    return this.repository.save(courses
      .filter(({ sameAs }) => sameAs.length > 0)
      .map((courseData) => {
        const thisCourse = savedCourses.find(({ prefix, number }) => (
          prefix === courseData.prefix && number === courseData.number
        ));
        const parentCourse = savedCourses.find(({ prefix, number }) => (
          `${prefix} ${number}` === courseData.sameAs
        ));
        return {
          ...thisCourse,
          sameAs: parentCourse,
        };
      }));
  }

  public async drop(): Promise<void> {
    await this.repository.query('TRUNCATE TABLE course, course_instance, meeting, faculty_course_instances_course_instance CASCADE;');
  }
}
