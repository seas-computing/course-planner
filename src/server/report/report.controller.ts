import {
  Controller,
  Inject,
  UseGuards,
  Get,
  Res,
  BadRequestException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { GROUP } from 'common/constants';
import { Response } from 'express';
import Excel from 'exceljs';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RequireGroup } from '../auth/group.guard';
import { Authentication } from '../auth/authentication.guard';
import { ReportService } from './report.service';
import { SemesterService } from '../semester/semester.service';

/**
 * Defines server endpoints for generating excel reports of data in the
 * applciation. Note that these are not under the `/api/ path
 */

@Controller('report')
@UseGuards(Authentication, new RequireGroup(GROUP.READ_ONLY))
export class ReportController {
  @Inject(ReportService)
  private readonly reportService: ReportService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  /**
   * Provides an xlsx report with all of the course data from the main table.
   * By default, it provides info on course instances in all semesters from the
   * currentAcademicYear through to the last academic year in the database.
   * @TODO  Add query string parameters for startYear and endYear (future
   * feature)
   */
  @ApiTags('Reports')
  @ApiOperation({ summary: 'Generate an xlsx report on course instances' })
  @ApiOkResponse({
    type: Excel.Workbook,
    description: 'An excel file containing all of the course instance data in a single sheet',
  })
  @ApiBadRequestResponse({
    description: 'If the starting or ending year of the report does not exist in the database',
  })
  @Get('/courses')
  public async getCoursesReport(
    @Res() res: Response,
      @Query('startYear', ParseIntPipe) startYear: number,
      @Query('endYear', ParseIntPipe) endYear: number
  ): Promise<void> {
    const allYears = await this.semesterService.getYearList();
    if (!allYears.includes(startYear.toString())) {
      throw new BadRequestException('Invalid start year');
    }
    if (!allYears.includes(endYear.toString())) {
      throw new BadRequestException('Invalid end year');
    }
    if (endYear < startYear) {
      throw new BadRequestException('End year cannot be earlier than start year');
    }
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="courses_${startYear}-${endYear}.xlsx"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    return this.reportService
      .streamCoursesReport(res, startYear, endYear);
  }

  /**
   * Provides an xlsx report with all of the faculty data from the main table.
   * By default, it provides info on faculty in all semesters from the
   * currentAcademicYear through to the last academic year in the database.
   */
  @ApiTags('Reports')
  @ApiOperation({ summary: 'Generate an xlsx report on faculty' })
  @ApiOkResponse({
    type: Excel.Workbook,
    description: 'An excel file containing all of the faculty data in a single sheet',
  })
  @ApiBadRequestResponse({
    description: 'The starting or ending year of the report does not exist in the database',
  })
  @Get('/faculty')
  public async getFacultyReport(
    @Res() res: Response,
      @Query('startYear', ParseIntPipe) startYear: number,
      @Query('endYear', ParseIntPipe) endYear: number
  ): Promise<void> {
    const allYears = await this.semesterService.getYearList();
    if (!allYears.includes(startYear.toString())) {
      throw new BadRequestException('Invalid start year');
    }
    if (!allYears.includes(endYear.toString())) {
      throw new BadRequestException('Invalid end year');
    }
    if (endYear < startYear) {
      throw new BadRequestException('End year cannot be earlier than start year');
    }
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="courses_${startYear}-${endYear}.xlsx"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    return this.reportService
      .streamFacultyReport(res, startYear, endYear);
  }
}
