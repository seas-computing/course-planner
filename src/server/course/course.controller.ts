import { Controller, Get } from '@nestjs/common';
import { ManageCourseResponseDTO } from 'common/dto/courses/manageCourse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Course } from './course.entity';

@Controller('course')
export class CourseController {
  @InjectRepository(Course)
  private courseRepository: Repository<Course>

  @Get('/')
  @ApiOperation({ title: 'Retrieve all courses in the database' })
  @ApiOkResponse({
    type: ManageCourseResponseDTO,
    description: 'An array of all the courses along with their area',
    isArray: true,
  })
  public async getAll(): Promise<ManageCourseResponseDTO[]> {
    const courses = await this.courseRepository.find({
      relations: ['area'],
    });

    return courses.map(({
      updatedAt, // eslint-disable-line  @typescript-eslint/no-unused-vars
      createdAt, // eslint-disable-line  @typescript-eslint/no-unused-vars
      ...course
    }: Course): ManageCourseResponseDTO => ({
      ...course,
      area: {
        id: course.area.id,
        name: course.area.name,
      },
      catalogNumber: `${course.prefix} ${course.number}`,
    }));
  }
}
