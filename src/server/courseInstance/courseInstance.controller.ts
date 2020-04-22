import {
  Controller,
  Get,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUseTags,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiImplicitQuery,
} from '@nestjs/swagger';
import { Authentication } from 'server/auth/authentication.guard';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import CourseResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { CourseInstanceService } from './courseInstance.service';
import { SemesterService } from '../semester/semester.service';

@Controller('api/course-instances')
export class CourseInstanceController {
  @Inject(CourseInstanceService)
  private readonly ciService: CourseInstanceService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  /**
   * Responds with an aggregated list of courses and their instances.
   * If there are no valid years requested, an empty array will be returned
   *
   * @param acadYear A list of comma-separated list of four-digit years,
   * representing the **academic** years for which instances are being
   * requested. This means a request for 2020 will return a course object with
   * instances in Fall 2019 and Spring 2020. Omitting the parameter will return
   * all years (and probably throw an out-of-memory error).
   */

  @Get('/')
  public async getInstances(
    @Query('acadYear') years?: string
  ): Promise<CourseResponseDTO[][]> {
    let yearList: string[];

    // fetch a list of all valid years
    const allYears = await this.semesterService.getYearList();

    if (years) {
      // deduplicate requested years
      yearList = Array.from(new Set(years.trim().split(',')))
        // filter out anything that's not a valid year
        .filter((year): boolean => allYears.includes(year))
        // sort years ascending
        .sort();
    } else {
      // if we didn't get a list of years, send back everything
      yearList = [...allYears];
    }
    return Promise.all(
      yearList.map(
        (year: string): Promise<CourseResponseDTO[]> => {
          const requestYear = parseInt(year, 10);
          return this.ciService.getAllByYear(requestYear);
        }
      )
    );
  }

  /**
   * Responds with a list of multiyear plan records
   *
   * @param numYears represents the number of years that the Multi Year Plan
   * will show. Its value defaults to 4 years.
   */
  @ApiUseTags('Course Instance')
  @ApiForbiddenResponse({
    description: 'The user is not authenticated',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is authenticated, but lacks the permissions to access this endpoint',
  })
  @Get('/multi-year-plan')
  @ApiOperation({ title: 'Retrieve the multi-year plan' })
  @ApiOkResponse({
    type: MultiYearPlanResponseDTO,
    description: 'An array of all the multi-year plan records',
    isArray: true,
  })
  @ApiImplicitQuery({
    name: 'numYears',
    description: 'Represents the number of years that the Multi Year Plan will show',
  })
  public async getMultiYearPlan(
    @Query('numYears') numYears?: number
  ): Promise<MultiYearPlanResponseDTO[]> {
    return this.ciService.getMultiYearPlan(numYears);
  }
}
