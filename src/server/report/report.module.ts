import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { CourseInstanceModule } from '../courseInstance/courseInstance.module';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    CourseInstanceModule,
    SemesterModule,
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
