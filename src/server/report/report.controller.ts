import {
  Controller, Inject, UseGuards, Get, Res, BadRequestException,
} from '@nestjs/common';
import { GROUP } from 'common/constants';
import { Response } from 'express';
import { RequireGroup } from '../auth/group.guard';
import { Authentication } from '../auth/authentication.guard';
import { ReportService } from './report.service';
import { ConfigService } from '../config/config.service';
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

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Inject(SemesterService)
  private readonly semesterService: SemesterService;

  @Get('/courses')
  public async getCoursesReport(
    @Res() res: Response
  ): Promise<void> {
    const { academicYear: startYear } = this.configService;
    const allYears = await this.semesterService.getYearList();
    if (!allYears.includes(startYear.toString())) {
      throw new BadRequestException();
    }
    const endYear = parseInt([...allYears].pop(), 10);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="courses_${startYear}-${endYear}.xlsx"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    return this.reportService
      .streamCoursesReport(res, startYear, endYear);
  }
}
