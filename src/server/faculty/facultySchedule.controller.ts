import {
  Controller,
  Get,
  UseGuards,
  Inject,
  Param,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUseTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { Authentication } from 'server/auth/authentication.guard';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { FacultyScheduleService } from './facultySchedule.service';

@ApiUseTags('Faculty')
@UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
@Controller('api/faculty/schedule')
@ApiUnauthorizedResponse({ description: 'Thrown if the user is not authenticated' })
export class FacultyScheduleController {
  @Inject(FacultyScheduleService)
  private readonly facultyScheduleService: FacultyScheduleService;

  @Get('/')
  @ApiOperation({ title: 'Retrieve all faculty along with their area, course instances, and absences' })
  @ApiOkResponse({
    type: FacultyResponseDTO,
    description: 'An array of all the faculty along with their area, course instances, and absences',
    isArray: true,
  })
  public async getAll(
    @Param('acadYears') acadYears?: string
  ): Promise<{ [key: string]: FacultyResponseDTO[] }> {
    const acadYearsArray = acadYears != null
      ? acadYears.split(',')
        .map((year): number => parseInt(year.trim(), 10))
      : undefined;
    return this.facultyScheduleService.getAllFaculty(acadYearsArray);
  }
}
