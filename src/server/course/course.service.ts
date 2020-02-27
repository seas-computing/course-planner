import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Semester } from 'server/semester/semester.entity';
import { Course } from './course.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';

@Injectable()
export class CourseService {
  @InjectRepository(Semester)
  private semesterRepository: Repository<Semester>;

  @InjectRepository(Course)
  private courseRepository: Repository<Course>;

  public async save(course: DeepPartial<Course>): Promise<Course> {
    const semesters = await this.semesterRepository.find({});

    return this.courseRepository.save({
      ...course,
      instances: semesters.map((semester: Semester): CourseInstance => ({
        ...new CourseInstance(),
        semester,
      })),
    });
  }
}
