import {
  Controller,
  Get,
  Query,
  Inject,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUseTags,
  ApiImplicitQuery,
} from '@nestjs/swagger';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { ConfigService } from 'server/config/config.service';
import { CourseInstanceService } from './courseInstance.service';
import { SemesterService } from '../semester/semester.service';

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
   * @param acadYear A list of comma-separated list of four-digit years,
   * representing the **academic** years for which instances are being
   * requested. This means a request for 2020 will return a course object with
   * instances in Fall 2019 and Spring 2020. Omitting the parameter will return
   * all years (and probably throw an out-of-memory error).
   */

  @Get('/')
  public async getInstances(
    @Query('acadYear') years?: string
  ): Promise<CourseInstanceResponseDTO[][]> {
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
        (year: string): Promise<CourseInstanceResponseDTO[]> => {
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
  @Get('/multi-year-plan')
  public async getMultiYearPlan(
    @Query('numYears') numYears: number = 4
  ): Promise<MultiYearPlanResponseDTO[]> {
    // If an invalid number of years is provided, use the default number of years
    const validatedNumYears = (
      Math.floor(numYears) > 0
    ) ? Math.floor(numYears) : 4;
    // Fetch the current academic year and convert each year to a number
    // so that we can calculate the plans for specified or default number of years
    const { academicYear } = this.configService;
    const academicYears = Array.from({ length: validatedNumYears })
      .map((value, index): number => index)
      .map((offset): number => academicYear + offset);
    return this.ciService.getMultiYearPlan(academicYears);
  }
}
