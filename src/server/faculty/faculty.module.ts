import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Semester } from 'server/semester/semester.entity';
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
      Semester,
      Faculty,
      Area,
      Absence,
      FacultyScheduleCourseView,
      FacultyScheduleSemesterView,
      FacultyScheduleView,
    ]),
    SemesterModule,
  ],
  controllers: [
    FacultyController,
  ],
  providers: [
    FacultyListingView,
    FacultyService,
    FacultyScheduleService,
  ],
})
export class FacultyModule { }
