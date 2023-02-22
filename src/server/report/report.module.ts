import { Module } from '@nestjs/common';
import { FacultyModule } from 'server/faculty/faculty.module';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { CourseInstanceModule } from '../courseInstance/courseInstance.module';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    CourseInstanceModule,
    SemesterModule,
    FacultyModule,
  ],
  providers: [
    ReportService,
  ],
  controllers: [
    ReportController,
  ],
  exports: [
    ReportService,
  ],
})
export class ReportModule { }
