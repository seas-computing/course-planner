import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Course } from 'server/course/course.entity';
import { Semester } from 'server/semester/semester.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { Absence } from 'server/absence/absence.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
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
      Semester,
      Course,
      CourseInstance,
      Absence,
      FacultyCourseInstance,
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
