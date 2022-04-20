import {
  Controller,
  Get,
  Query,
  Inject,
  BadRequestException,
  UseGuards,
  Body,
  Put,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { ConfigService } from 'server/config/config.service';
import { NUM_YEARS, TERM, GROUP } from 'common/constants';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import { SemesterService } from 'server/semester/semester.service';
import { EntityNotFoundError } from 'typeorm';
import CourseInstanceUpdateDTO from 'common/dto/courses/CourseInstanceUpdate.dto';
import { CourseInstanceService } from './courseInstance.service';
import { InstructorResponseDTO } from '../../common/dto/courses/InstructorResponse.dto';
import { RequireGroup } from '../auth/group.guard';
import { Authentication } from '../auth/authentication.guard';
import { InstructorRequestDTO } from '../../common/dto/courses/InstructorRequest.dto';

@Controller('api/course-instances')
export class CourseInstanceController {
  @Inject(CourseInstanceService)
  private readonly ciService: CourseInstanceService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  /**
   * Responds with an aggregated list of courses and their instances.
   * If there are no valid years requested, an empty array will be returned
   *
   * @param acadYear A single academic year whose semesters should be included
   * in the list of course instances.
   */

  @UseGuards(Authentication, new RequireGroup(GROUP.READ_ONLY))
  @Get('/')
  public async getInstances(
    @Query('acadYear') year?: string
  ): Promise<CourseInstanceResponseDTO[]> {
    // fetch a list of all valid years
    const allYears = await this.semesterService.getYearList();

    const requestYear = parseInt(year, 10);
    if (year && allYears.includes(requestYear.toString())) {
      return this.ciService.getAllByYear(requestYear);
    }
    return [];
  }

  /**
   * Computes the academic year list for the number of years specified
   */
  public computeAcademicYears(numYears: number): number[] {
    // Fetch the current academic year and convert each year to a number
    // so that we can calculate the plans for the specified number of years
    const { academicYear } = this.configService;
    const academicYears = Array.from(
      { length: numYears },
      (_, offset): number => academicYear + offset
    );
    return academicYears;
  }

  /**
   * Responds with a list of multiyear plan records.
   */
  @ApiTags('Course Instance')
  @ApiOperation({ summary: 'Retrieve the multi-year plan' })
  @ApiOkResponse({
    type: MultiYearPlanResponseDTO,
    description: 'An array of all the multi-year plan records',
    isArray: true,
  })
  @Get('/multi-year-plan')
  public async getMultiYearPlan(): Promise<MultiYearPlanResponseDTO[]> {
    // This uses the constant NUM_YEARS to calculate an array of academic years
    // for which we want multi-year plans.
    const academicYears = this.computeAcademicYears(NUM_YEARS);
    return this.ciService.getMultiYearPlan(academicYears);
  }

  /**
   * Retrieves the schedule data for all SEAS courses offered in a given term
   */

  @ApiTags('Course Instance')
  @ApiOperation({ summary: 'Retrieve Course Schedule Data' })
  @ApiOkResponse({
    type: ScheduleViewResponseDTO,
    description: 'An array of the schedule data for a given term',
    isArray: true,
  })
  @Get('/schedule')
  public async getScheduleData(
    @Query('term') term: TERM, @Query('year') year: string
  ): Promise<ScheduleViewResponseDTO[]> {
    const validTerms = Object.values(TERM);
    if (!validTerms.includes(term)) {
      throw new BadRequestException(`"term" must be "${validTerms.join('" or "')}"`);
    }
    const validYears = await this.semesterService.getYearList();
    if (!validYears.includes(year)) {
      return [];
    }
    return this.ciService.getCourseSchedule(term, year);
  }

  /**
   * Updates the list of instructors associated with a course instance.
   * Instructors will be assigned in the order of the array. Omitting an
   * instructor from the array removes that instructor from the course
   * (updating the order of other instructors, if applicable). An empty array
   * removes all instructors from the course
   */
  @UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
  @ApiTags('Course Instance')
  @ApiOperation({ summary: 'Update the list of instructors associated with a course' })
  @ApiOkResponse({
    type: InstructorResponseDTO,
    description: 'An array of instructor objects that can be merged back into the course instance data',
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Returned if the faculty or course instance provided do not exist in the database',
  })
  @Put('/:id/instructors')
  public async updateInstructorList(
    @Body('instructors') instructors: InstructorRequestDTO[],
      @Param('id') courseInstanceId: string
  ): Promise<InstructorResponseDTO[]> {
    try {
      const results = await this.ciService
        .assignInstructors(courseInstanceId, instructors);
      return results;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
  @ApiTags('Course Instance')
  @ApiOperation({ summary: 'Update the course instance with revised course instance data' })
  @ApiOkResponse({
    type: CourseInstanceResponseDTO,
    description: 'The revised course instance with updated offered and enrollment data',
  })
  @ApiNotFoundResponse({
    description: 'Returned if the course instance does not exist in the database',
  })
  @Put('/:id')
  public async updateCourseInstance(
    @Body() instance: CourseInstanceUpdateDTO,
      @Param('id') courseInstanceId: string
  )
      : Promise<CourseInstanceUpdateDTO> {
    try {
      const results = await this.ciService
        .editCourseInstance(courseInstanceId, instance);
      return results;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
