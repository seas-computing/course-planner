import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Course } from './course.entity';

@Injectable()
export class CourseService {
  @InjectRepository(Course)
  private courseRepository: Repository<Course>;

  public async insert(courses: DeepPartial<Course>[]): Promise<void> {
    await this.courseRepository.insert(courses);
  }
}
