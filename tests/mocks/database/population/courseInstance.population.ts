import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { Course } from 'server/course/course.entity';
import { Semester, TERM } from 'server/semester/semester.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OFFERED, TERM_PATTERN, DAY } from 'common/constants';
import { Meeting } from 'server/meeting/meeting.entity';
import { BasePopulationService } from './base.population';
import { Room } from 'server/location/room.entity';

export class CourseInstancePopulationService
  extends BasePopulationService<Course> {
  @InjectRepository(CourseInstance)
  protected Repository: Repository<CourseInstance>;

  @InjectRepository(Course)
  protected courseRepository: Repository<Course>;

  @InjectRepository(Semester)
  protected semesterRepository: Repository<Semester>;

  @InjectRepository(Room)
  protected roomRepository: Repository<Room>;

  private shouldBeOffered(pattern: TERM_PATTERN, term: TERM): OFFERED {
    if (
      pattern === TERM_PATTERN.BOTH
      || (pattern === TERM_PATTERN.SPRING && term === TERM.SPRING)
      || (pattern === TERM_PATTERN.FALL && term === TERM.FALL)
    ) {
      if (Math.random() > 0.9) {
        return OFFERED.N;
      }
      return OFFERED.Y;
    }
    return OFFERED.BLANK;
  }

  private generateMeetings(): Meeting[] {
    const meetingCount = Math.ceil(Math.random() * 3);
    return Array(meetingCount).map((): Meeting => {
      const meeting = new Meeting();
      meeting.day = Object.values(DAY)[
        Math.floor(Math.random() * Object.values(DAY).length)
      ];

      return meeting;
    }
  }

  public generateFake(course: Course, semester: Semester): CourseInstance {
    const instance = new CourseInstance();
    instance.course = course;
    instance.semester = semester;
    const offered = this.shouldBeOffered(course.termPattern, semester.term);
    if (offered === OFFERED.N || offered === OFFERED.BLANK) {
      return instance;
    }
    instance.preEnrollment = Math.ceil(Math.random() * 100);
    instance.studyCardEnrollment = instance.preEnrollment
      - (Math.floor(Math.random() * 25));
    instance.actualEnrollment = instance.studyCardEnrollment
      - (Math.floor(Math.random() * 10));
    instance.meetings = this.generateMeetings();
    return instance;
  }

  public async populate() {
    const semesters = await this.semesterRepository.find(
      {
        order: {
          academicYear: 'ASC',
          term: 'ASC',
        },
      }
    );

    const courses = await this.courseRepository.find(
      {
        order: {
          prefix: 'ASC',
          number: 'ASC',
        },
      }
    );

    return this.repository.save(
      courses.reduce(
        (list: CourseInstance[], course: Course) => list.concat(
          semesters.map(
            (semester) => this.generateFake(course, semester)
          )
        ), [] as CourseInstance[]
      )
    );
  }
}
