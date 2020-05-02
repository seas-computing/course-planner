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
import { FacultyScheduleService } from './facultySchedule.service';

@ApiUseTags('Faculty Schedule')
@UseGuards(Authentication)
@Controller('api/faculty/schedule')
@ApiUnauthorizedResponse({ description: 'Thrown if the user is not authenticated' })
export class FacultyScheduleController {
  @Inject(FacultyScheduleService)
  private readonly facultyScheduleService: FacultyScheduleService;

  @Get('/')
  @ApiOperation({ title: 'Retrieve all faculty along with their area, course instances, and absences' })
  @ApiOkResponse({
    type: Object,
    description: 'An object where the academic year maps to an array of faculty along with their area, course instances, and absences',
  })
  public async getAll(
    @Query('acadYears') acadYears?: string
  ): Promise<{ [key: string]: FacultyResponseDTO[] }> {
    const acadYearsArray = acadYears != null
      ? acadYears.split(',')
        .map((year): number => parseInt(year.trim(), 10))
      : undefined;
    return this.facultyScheduleService.getAllByYear(acadYearsArray);
  }
}
