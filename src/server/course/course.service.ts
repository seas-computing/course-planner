import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Semester } from 'server/semester/semester.entity';
import { Area } from 'server/area/area.entity';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { Course } from './course.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';

@Injectable()
export class CourseService {
  @InjectRepository(Area)
  private areaRepository: Repository<Area>;

  @InjectRepository(Semester)
  private semesterRepository: Repository<Semester>;

  @InjectRepository(Course)
  private courseRepository: Repository<Course>;

  /**
   * Retrieve all courses in the database and sort by:
   * - area ASC
   * - catalogNumber ASC
   */
  public async findCourses(): Promise<ManageCourseResponseDTO[]> {
    return await this.courseRepository
      .createQueryBuilder('c')
      .addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
      .leftJoinAndSelect('c.area', 'area')
      .orderBy('area.name', 'ASC')
      .addOrderBy('"catalogNumber"', 'ASC')
      .getMany() as unknown as ManageCourseResponseDTO[];
  }

  public async save(course: DeepPartial<Course>): Promise<Course> {
    await this.areaRepository.findOneOrFail(course.area.id);

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
