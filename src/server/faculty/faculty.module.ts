import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SemesterService } from 'server/semester/semester.service';
import { Semester } from 'server/semester/semester.entity';
import { Absence } from 'server/absence/absence.entity';
import { CourseInstanceService } from 'server/courseInstance/courseInstance.service';
import { Course } from 'server/course/course.entity';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { CourseInstanceListingView } from 'server/courseInstance/CourseInstanceListingView.entity';
import { ScheduleBlockView } from 'server/courseInstance/ScheduleBlockView.entity';
import { ScheduleEntryView } from 'server/courseInstance/ScheduleEntryView.entity';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { NonClassParent } from 'server/nonClassEvent/nonclassparent.entity';
import { NonClassParentView } from 'server/nonClassEvent/NonClassParentView.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { NonClassEventService } from 'server/nonClassEvent/nonClassEvent.service';
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
      Course,
      CourseInstance,
      CourseInstanceListingView,
      CourseListingView,
      FacultyCourseInstance,
      MultiYearPlanView,
      ScheduleBlockView,
      ScheduleEntryView,
      SemesterView,
      NonClassParent,
      NonClassParentView,
      NonClassEvent,
    ]),
  ],
  controllers: [
    FacultyController,
  ],
  providers: [
    FacultyListingView,
    FacultyService,
    FacultyScheduleService,
    SemesterService,
    CourseInstanceService,
    NonClassEventService,
  ],
})
export class FacultyModule { }
