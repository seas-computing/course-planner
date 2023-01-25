import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Absence } from 'server/absence/absence.entity';
import { SemesterModule } from 'server/semester/semester.module';
import { FacultyController } from './faculty.controller';
import { Faculty } from './faculty.entity';
import { Area } from '../area/area.entity';
import { FacultyService } from './faculty.service';
import { FacultyScheduleService } from './facultySchedule.service';
import { FacultyScheduleView } from './FacultyScheduleView.entity';
import { FacultyScheduleCourseView } from './FacultyScheduleCourseView.entity';
import { FacultyScheduleSemesterView } from './FacultyScheduleSemesterView.entity';
import { FacultyListingView } from './FacultyListingView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
      Area,
      Absence,
      FacultyScheduleCourseView,
      FacultyScheduleSemesterView,
      FacultyScheduleView,
    ]),
    forwardRef(() => SemesterModule),
  ],
  controllers: [
    FacultyController,
  ],
  providers: [
    FacultyListingView,
    FacultyService,
    FacultyScheduleService,
  ],
  exports: [
    TypeOrmModule,
  ],
})
export class FacultyModule { }
