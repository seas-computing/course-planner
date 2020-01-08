import { Controller, Get, UseGuards } from '@nestjs/common';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { Course } from './course.entity';
import { Authentication } from '../auth/authentication.guard';

@ApiUseTags('Course')
@Controller('api/courses')
@ApiUnauthorizedResponse({ description: 'Thrown if the user is not authenticated' })
@UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
export class CourseController {
  @InjectRepository(Course)
  private readonly courseRepository: Repository<Course>;

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

    return courses.map((course: Course): ManageCourseResponseDTO => ({
      ...course,
      catalogNumber: `${course.prefix} ${course.number}`,
    }));
  }
}
