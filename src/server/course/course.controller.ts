import { Controller, Get, UseGuards, Body, Inject } from '@nestjs/common';
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
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { Authentication } from 'server/auth/authentication.guard';
import { Course } from './course.entity';
import { CourseService } from './course.service';

@ApiUseTags('Course')
@Controller('api/courses')
@ApiUnauthorizedResponse({ description: 'Thrown if the user is not authenticated' })
@UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
export class CourseController {
  @Inject(CourseService)
  private readonly courseService: CourseService;

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
    return this.courseRepository.find({
      relations: ['area'],
    });
  }

  public async create(
    @Body() course: CreateCourse
  ): Promise<ManageCourseResponseDTO> {
    const [newCourse] = await this.courseService.save([course]);

    return newCourse;
  }
}
