import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ManageFacultyController } from './faculty.controller';
import { Faculty } from './faculty.entity';
import { Area } from '../area/area.entity';
import { MultiYearPlanFacultyListingView } from '../courseInstance/MultiYearPlanFacultyListingView.entity';
import { FacultyService } from './faculty.service';
import { FacultyScheduleController } from './facultySchedule.controller';
import { FacultyScheduleService } from './facultySchedule.service';
import { FacultyScheduleView } from './FacultyScheduleView.entity';
import { FacultyScheduleAbsenceView } from './FacultyScheduleAbsenceView.entity';
import { FacultyScheduleCourseView } from './FacultyScheduleCourseView.entity';
import { FacultyScheduleSemesterView } from './FacultyScheduleSemesterView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Faculty,
      Area,
      FacultyScheduleAbsenceView,
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
  ],
})
export class FacultyModule { }
