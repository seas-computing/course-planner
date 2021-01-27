import {
  Controller,
  Get,
  Query,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUseTags,
} from '@nestjs/swagger';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { MultiYearPlanResponseDTO, MultiYearPlanSemester } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { ConfigService } from 'server/config/config.service';
import { TERM } from 'common/constants';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import { SemesterService } from 'server/semester/semester.service';
import { CourseInstanceService } from './courseInstance.service';

@Controller('api/course-instances')
export class CourseInstanceController {
  @Inject(CourseInstanceService)
  private readonly ciService: CourseInstanceService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  public static NUM_YEARS = 4;

  public static NUM_SEMESTERS = CourseInstanceController.NUM_YEARS * 2;

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
   * If the number of semesters worth of multi year plans requested is more than
   * what exists in the database, this function will create the correct number
   * of semesters to supplement the missing ones.
   */
  @ApiUseTags('Course Instance')
  @ApiOperation({ title: 'Retrieve the multi-year plan' })
  @ApiOkResponse({
    type: MultiYearPlanResponseDTO,
    description: 'An array of all the multi-year plan records',
    isArray: true,
  })
  @Get('/multi-year-plan')
  public async getMultiYearPlan(): Promise<MultiYearPlanResponseDTO[]> {
    // The number of years specified for the multi year plan
    const numYears = CourseInstanceController.NUM_YEARS;
    const expectedNumSemesters = CourseInstanceController.NUM_SEMESTERS;
    const academicYears = this.computeAcademicYears(numYears);
    let multiYearPlans
    : MultiYearPlanResponseDTO[] = await this.ciService
      .getMultiYearPlan(academicYears);
    const numSemestersReturned = multiYearPlans[0]
      ? multiYearPlans[0].semesters.length
      : 0;
    const missingNumSemesters = expectedNumSemesters - numSemestersReturned;
    // In cases in which the database does not have sufficient semester rows, we
    // would like to populate the missing semesters so that we always get the
    // number of years worth of multi-year plans that is requested.
    const createMissingSemester = (offset: number) => {
      const semesterIndex = numSemestersReturned + offset;
      // E.g. If the first academic year is 2021, numSemestersReturned is 4
      // and offset is 0, then
      // firstMissingAcademicYear = 2021 + Math.floor((4 + 0) / 2) = 2023,
      // and term will be FALL.
      // If offset is 1, then firstMissingAcademicYear is still 2023,
      // while term will be SPRING.
      const firstMissingAcademicYear = academicYears[0]
        + Math.floor(semesterIndex / 2);
      const term = semesterIndex % 2 === 0
        ? TERM.FALL
        : TERM.SPRING;
      const calendarYear = term === TERM.FALL
        ? firstMissingAcademicYear - 1
        : firstMissingAcademicYear;
      return {
        id: `missingSemester${offset}`,
        academicYear: String(firstMissingAcademicYear),
        calendarYear: String(calendarYear),
        term,
        instance: {
          id: `missingInstance${offset}`,
          faculty: [],
        },
      };
    };
    const missingSemesters: MultiYearPlanSemester[] = Array.from(
      new Array(missingNumSemesters)
    ).map((_, index) => (
      createMissingSemester(index)
    ));
    if (missingNumSemesters > 0) {
      multiYearPlans = multiYearPlans.map((plan) => ({
        ...plan,
        semesters: [...plan.semesters, ...missingSemesters],
      }));
    }
    return multiYearPlans;
  }

  /**
   * Retrieves the schedule data for all SEAS courses offered in a given term
   */

  @ApiUseTags('Course Instance')
  @ApiOperation({ title: 'Retrieve Course Schedule Data' })
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
}
