import {
  Controller,
  Get,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUseTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { Authentication } from 'server/auth/authentication.guard';
import { Area } from 'server/area/area.entity';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { Faculty } from './faculty.entity';
import { FacultyScheduleService } from './facultySchedule.service';

@ApiUseTags('Faculty')
@UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
@Controller('api/faculty/schedule')
@ApiUnauthorizedResponse({ description: 'Thrown if the user is not authenticated' })
export class FacultyScheduleController {
  @InjectRepository(Faculty)
  private facultyRepository: Repository<Faculty>

  @InjectRepository(Area)
  private areaRepository: Repository<Area>

  @Inject(FacultyScheduleService)
  private readonly facultyScheduleService: FacultyScheduleService;

  @Get('/')
  @ApiOperation({ title: 'Retrieve all faculty along with their area, course instances, and absences' })
  @ApiOkResponse({
    type: FacultyResponseDTO,
    description: 'An array of all the faculty along with their area, course instances, and absences',
    isArray: true,
  })
  public async getAll(): Promise<FacultyResponseDTO[]> {
    return this.facultyScheduleService.getAll();
  }
}
