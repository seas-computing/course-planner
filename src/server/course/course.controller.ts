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
import { Area } from 'server/area/area.entity';
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

  @InjectRepository(Area)
  private areaRepository: Repository<Area>;

  @Get('/')
  @ApiOperation({ title: 'Retrieve all courses in the database' })
  @ApiOkResponse({
    type: ManageCourseResponseDTO,
    description: 'An array of all the courses along with their area',
    isArray: true,
  })
  public async getAll(): Promise<ManageCourseResponseDTO[]> {
    return this.courseService.findCourses();
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
    let area: Partial<Area> = await this.areaRepository
      .findOne({
        where: {
          name: course.area,
        },
      });
    // If missing, the area will be created
    // by the cascade insert set on the Course entity
    if (area == null) {
      area = { name: course.area };
    }

    const fullCourse = {
      ...course,
      area,
    };

    const {
      number,
      prefix,
      ...newCourse
    } = await this.courseService.save(fullCourse);

    return {
      ...newCourse,
      catalogNumber: `${prefix} ${number}`,
    };
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
    @Param('id') id: string, @Body() course: UpdateCourseDTO
  ): Promise<ManageCourseResponseDTO> {
    let area: Partial<Area> = await this.areaRepository
      .findOne({
        where: {
          name: course.area,
        },
      });
    // If missing, the area will be created
    // by the cascade insert set on the Course entity
    if (area == null) {
      area = { name: course.area };
    }
    try {
      await this.courseRepository.findOneOrFail(id);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(`Unable to find course ${id}`);
      } else {
        throw e;
      }
    }

    const fullCourse = {
      ...course,
      area,
    };

    const {
      prefix,
      number,
      ...updatedCourse
    } = await this.courseRepository.save({
      id,
      ...fullCourse,
    });

    return {
      ...updatedCourse,
      catalogNumber: `${prefix} ${number}`,
    };
  }
}
