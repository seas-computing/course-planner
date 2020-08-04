import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
  NotFoundException,
  Inject,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUseTags,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import { CreateFacultyDTO } from 'common/dto/faculty/CreateFaculty.dto';
import { UpdateFacultyDTO } from 'common/dto/faculty/UpdateFaculty.dto';
import { Authentication } from 'server/auth/authentication.guard';
import { Area } from 'server/area/area.entity';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { SemesterService } from 'server/semester/semester.service';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { Faculty } from './faculty.entity';
import { FacultyService } from './faculty.service';
import { FacultyScheduleService } from './facultySchedule.service';

@ApiUseTags('Faculty')
@UseGuards(Authentication)
@Controller('api/faculty')
@ApiUnauthorizedResponse({ description: 'Thrown if the user is not authenticated' })
export class FacultyController {
  @InjectRepository(Faculty)
  private facultyRepository: Repository<Faculty>;

  @InjectRepository(Area)
  private areaRepository: Repository<Area>;

  @Inject(FacultyService)
  private facultyService: FacultyService;

  @Inject(FacultyScheduleService)
  private readonly facultyScheduleService: FacultyScheduleService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  @UseGuards(new RequireGroup(GROUP.ADMIN))
  @Get('/')
  @ApiOperation({ title: 'Retrieve all faculty in the database' })
  @ApiOkResponse({
    type: ManageFacultyResponseDTO,
    description: 'An array of all the faculty along with their area',
    isArray: true,
  })
  public async getAll(): Promise<ManageFacultyResponseDTO[]> {
    return this.facultyService.find();
  }

  /**
   * Responds with an object in which the requested academic year(s) maps to an
   * array of faculty along with their area, course instances, and absences.
   *
   * @param acadYears is an array of strings that represent academic years for
   * which faculty schedule data is being requested. If no argument is provided
   * for acadYears, all years will be returned.
   */
  @UseGuards(new RequireGroup(GROUP.READ_ONLY))
  @Get('/schedule')
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

  @UseGuards(new RequireGroup(GROUP.ADMIN))
  @Post('/')
  @ApiOperation({ title: 'Create a new faculty entry in the database' })
  @ApiOkResponse({
    type: ManageFacultyResponseDTO,
    description: 'An object with the newly created faculty member\'s information.',
    isArray: false,
  })
  @ApiNotFoundResponse({
    description: 'Not Found: The requested entity could not be found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: the request is not in accordance with the createFaculty DTO',
  })
  public async create(@Body() facultyDto: CreateFacultyDTO):
  Promise<ManageFacultyResponseDTO> {
    let existingArea: Area;
    try {
      existingArea = await this.areaRepository
        .findOneOrFail({
          where: {
            name: facultyDto.area,
          },
        });
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('The entered Area does not exist');
      }
    }
    let faculty: Faculty = Object.assign(new Faculty(), {
      HUID: facultyDto.HUID,
      firstName: facultyDto.firstName,
      lastName: facultyDto.lastName,
      category: facultyDto.category,
      area: existingArea,
      jointWith: facultyDto.jointWith,
      notes: facultyDto.notes,
    });
    faculty = await this.facultyRepository.save(faculty);
    return {
      id: faculty.id,
      HUID: faculty.HUID,
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      category: faculty.category,
      area: {
        id: faculty.area.id,
        name: faculty.area.name,
      },
      jointWith: faculty.jointWith,
      notes: faculty.notes,
    };
  }

  @UseGuards(new RequireGroup(GROUP.ADMIN))
  @Put(':id')
  @ApiOperation({ title: 'Edit an existing faculty entry in the database' })
  @ApiOkResponse({
    type: ManageFacultyResponseDTO,
    description: 'An object with the edited faculty member\'s information.',
    isArray: false,
  })
  @ApiNotFoundResponse({
    description: 'Not Found: The requested entity could not be found',
  })
  @ApiNotFoundResponse({
    description: 'Not Found: The requested entity with the ID supplied could not be found',
  })
  public async update(@Param('id') id: string, @Body() faculty: UpdateFacultyDTO):
  Promise<ManageFacultyResponseDTO> {
    let existingArea: Area;
    try {
      existingArea = await this.areaRepository
        .findOneOrFail({
          where: {
            name: faculty.area,
          },
        });
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('The entered Area does not exist');
      }
      throw e;
    }
    try {
      await this.facultyRepository.findOneOrFail(id);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('Could not find any entity of type Faculty in any Area with the supplied ID');
      }
      throw e;
    }
    const validFaculty = {
      ...faculty,
      area: existingArea,
    };
    return this.facultyRepository.save(validFaculty);
  }
}
