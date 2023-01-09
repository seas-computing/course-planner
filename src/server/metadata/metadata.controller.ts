import {
  Controller,
  Get,
  Inject,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SemesterService } from 'server/semester/semester.service';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import { AreaService } from 'server/area/area.service';
import { ConfigService } from 'server/config/config.service';
import { CourseService } from 'server/course/course.service';
import { LocationService } from 'server/location/location.service';

@ApiTags('Metadata')
@Controller('api/metadata')
export class MetadataController {
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Inject(AreaService)
  private readonly areaService: AreaService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  @Inject(CourseService)
  private readonly courseService: CourseService;

  @Inject(LocationService)
  private readonly locationService: LocationService;

  /**
   * Responds with an object containing data about the current academic year,
   * currently existing areas, semesters, and catalog prefixes that exist in
   * the database
   */
  @Get('/')
  @ApiOperation({ summary: 'Retrieve metadata from the database' })
  @ApiOkResponse({
    type: MetadataResponse,
    description: 'An object of metadata containing information regarding the current academic year, existing areas, and existing semesters in the database',
  })
  public async getMetadata(): Promise<MetadataResponse> {
    return {
      currentAcademicYear: this.configService.academicYear,
      areas: await this.areaService.getAreaList(),
      semesters: await this.semesterService.getSemesterList(),
      catalogPrefixes: await this.courseService.getCatalogPrefixList(),
      campuses: await this.locationService.getCampusMetadata(),
    };
  }
}
