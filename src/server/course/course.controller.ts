import {
  Controller, Get, UseGuards, Body, Inject, Post, NotFoundException, Put, Param,
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
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { Authentication } from 'server/auth/authentication.guard';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { UpdateCourseDTO } from 'common/dto/courses/UpdateCourse.dto';
import { Course } from './course.entity';
import { CourseService } from './course.service';

@ApiUseTags('Course')
@Controller('api/courses')
@ApiForbiddenResponse({
  description: 'The user is not authenticated',
})
@ApiUnauthorizedResponse({
  description: 'The user is authenticated, but lacks the permissions to access this endpoint',
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
    const courses = await this.courseRepository.find({
      relations: ['area'],
    });

    return courses.map((course: Course): ManageCourseResponseDTO => ({
      ...course,
      catalogNumber: `${course.prefix} ${course.number}`,
    }));
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
      const {
        number,
        prefix,
        ...newCourse
      } = await this.courseService.save(course);
      return {
        ...newCourse,
        catalogNumber: `${prefix} ${number}`,
      };
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('Unable to find course area in database');
      } else {
        throw e;
      }
    }
  }

  @Put(':id')
  @ApiOperation({ title: 'Update an existing course' })
  @ApiOkResponse({
    type: ManageCourseResponseDTO,
    description: 'The updated course information',
  })
  @ApiNotFoundResponse({
    description: 'The course you attempted to be update could not be found',
  })
  @ApiBadRequestResponse({
    description: 'The supplied data did not meet validation requirements',
  })
  public async update(
    @Param('id') id: string,
    @Body() course: Partial<UpdateCourseDTO>
  ): Promise<ManageCourseResponseDTO> {
    try {
      await this.courseRepository.findOneOrFail(id);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(`Unable to find course ${id}`);
      }
    }

    const {
      prefix,
      number,
      ...updatedCourse
    } = await this.courseRepository.save({
      id,
      ...course,
    });

    return {
      ...updatedCourse,
      catalogNumber: `${prefix} ${number}`,
    };
  }
}
