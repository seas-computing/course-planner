import {
  Controller, Get, UseGuards, Body, Inject, Post, NotFoundException,
} from '@nestjs/common';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUseTags,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { Authentication } from 'server/auth/authentication.guard';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { Course } from './course.entity';
import { CourseService } from './course.service';

@ApiUseTags('Course')
@Controller('api/courses')
@ApiForbiddenResponse({
  description: 'The user is not authenticated',
})
@ApiUnauthorizedResponse({
  description: 'The user is authenticated lacks the permissions to access this endpoint',
})
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

  @Post('/')
  @ApiOperation({ title: 'Create a new course' })
  @ApiOkResponse({
    type: ManageCourseResponseDTO,
    description: 'The newly created course',
  })
  public async create(
    @Body() course: CreateCourse
  ): Promise<ManageCourseResponseDTO> {
    try {
      const newCourse = await this.courseService.save(course);

      return newCourse;
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('Unable to find course area in database');
      }
    }
  }
}
