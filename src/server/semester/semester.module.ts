import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'server/course/course.entity';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { CourseInstanceService } from 'server/courseInstance/courseInstance.service';
import { CourseInstanceListingView } from 'server/courseInstance/CourseInstanceListingView.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { MultiYearPlanInstanceView } from 'server/courseInstance/MultiYearPlanInstanceView.entity';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { ScheduleBlockView } from 'server/courseInstance/ScheduleBlockView.entity';
import { ScheduleEntryView } from 'server/courseInstance/ScheduleEntryView.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { Semester } from 'server/semester/semester.entity';
import { SemesterService } from './semester.service';
import { SemesterView } from './SemesterView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseInstance,
      CourseListingView,
      Faculty,
      FacultyCourseInstance,
      MultiYearPlanView,
      MultiYearPlanInstanceView,
      Semester,
      SemesterView,
      ScheduleBlockView,
      ScheduleEntryView,
      CourseInstanceListingView,
    ]),
  ],
  providers: [
    SemesterService,
    CourseInstanceService,
  ],
  exports: [SemesterService, TypeOrmModule],
})
export class SemesterModule { }
