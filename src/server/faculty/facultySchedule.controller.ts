import {
  Controller,
  Get,
  UseGuards,
  Inject,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUseTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Authentication } from 'server/auth/authentication.guard';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { SemesterService } from 'server/semester/semester.service';
import { FacultyScheduleService } from './facultySchedule.service';

@ApiUseTags('Faculty Schedule')
@UseGuards(Authentication)
@Controller('api/faculty/schedule')
@ApiUnauthorizedResponse({ description: 'Thrown if the user is not authenticated' })
export class FacultyScheduleController {
  @Inject(FacultyScheduleService)
  private readonly facultyScheduleService: FacultyScheduleService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  /**
   * Responds with an object in which the requested academic year(s) maps to an
   * array of faculty along with their area, course instances, and absences.
   *
   * @param acadYears is an array of strings that represent academic years for
   * which faculty schedule data is being requested. If no argument is provided
   * for acadYears, all years will be returned.
   */
  @Get('/')
  @ApiOperation({ title: 'Retrieve all faculty along with their area, course instances, and absences' })
  @ApiOkResponse({
    type: Object,
    description: 'An object where the academic year maps to an array of faculty along with their area, course instances, and absences',
  })
  public async getAllFaculty(
    @Query('acadYears') acadYears?: string
  ): Promise<{ [key: string]: FacultyResponseDTO[] }> {
    let acadYearStrings: string[];
    // fetch an array of all existing years
    const existingYears = await this.semesterService.getYearList();
    if (acadYears) {
      // deduplicate requested years
      acadYearStrings = Array.from(new Set(acadYears.trim().split(',')))
      // keep valid years only by filtering out years that do not exist in database
        .filter((year): boolean => existingYears.includes(year));
    } else {
      // if no years were provided, send back all years as an array of numbers
      acadYearStrings = [...existingYears];
    }
    const acadYearNums = acadYearStrings
      .map((year): number => parseInt(year, 10));
    // avoid unnecessary call to the service when there are no valid years
    if (acadYearNums.length === 0) {
      return {};
    }
    return this.facultyScheduleService.getAllByYear(acadYearNums);
  }
}
