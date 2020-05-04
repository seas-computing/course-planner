import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SemesterService } from 'server/semester/semester.service';
import { Semester } from 'server/semester/semester.entity';
import { ManageFacultyController } from './faculty.controller';
import { Faculty } from './faculty.entity';
import { Area } from '../area/area.entity';
import { MultiYearPlanFacultyListingView } from '../courseInstance/MultiYearPlanFacultyListingView.entity';
import { FacultyService } from './faculty.service';
import { FacultyScheduleController } from './facultySchedule.controller';
import { FacultyScheduleService } from './facultySchedule.service';
import { FacultyScheduleView } from './FacultyScheduleView.entity';
import { FacultyScheduleCourseView } from './FacultyScheduleCourseView.entity';
import { FacultyScheduleSemesterView } from './FacultyScheduleSemesterView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Semester,
      Faculty,
      Area,
      FacultyScheduleCourseView,
      FacultyScheduleSemesterView,
      FacultyScheduleView,
    ]),
  ],
  controllers: [
    ManageFacultyController,
    FacultyScheduleController,
  ],
  providers: [
    MultiYearPlanFacultyListingView,
    FacultyService,
    FacultyScheduleService,
    SemesterService,
  ],
})
export class FacultyModule { }
