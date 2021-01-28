import {
  Controller,
  Get,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUseTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Authentication } from 'server/auth/authentication.guard';
import { SemesterService } from 'server/semester/semester.service';
import { MetadataResponse } from 'common/dto/metadata/MetadataResponse.dto';
import { AreaService } from 'server/area/area.service';
import { ConfigService } from 'server/config/config.service';
import { CourseService } from 'server/course/course.service';

@ApiUseTags('Metadata')
@UseGuards(Authentication)
@Controller('api/metadata')
@ApiUnauthorizedResponse({ description: 'Thrown if the user is not authenticated' })
export class MetadataController {
  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Inject(AreaService)
  private readonly areaService: AreaService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  @Inject(CourseService)
  private readonly courseService: CourseService;

  /**
   * Responds with an object containing data about the current academic year,
   * currently existing areas, semesters, and catalog prefixes that exist in
   * the database
   */
  @Get('/')
  @ApiOperation({ title: 'Retrieve metadata from the database' })
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
    };
  }
}
