import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Course } from './course.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { Semester } from '../semester/semester.entity';

@Injectable()
export class CourseService {
  @InjectRepository(Semester)
  private semesterRepository: Repository<Semester>;

  @InjectRepository(Course)
  private courseRepository: Repository<Course>;

  public async save(courses: DeepPartial<Course>[]): Promise<void> {
    const semesters = await this.semesterRepository.find({});

    const scheduledCourses = courses.map((course: Course): Course => ({
      ...course,
      instances: semesters.map((semester: Semester): CourseInstance => ({
        ...new CourseInstance(),
        semester,
      })),
    }));

    this.courseRepository.save(scheduledCourses);
  }
}
