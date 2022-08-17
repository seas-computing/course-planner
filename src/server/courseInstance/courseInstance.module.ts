import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { MultiYearPlanInstanceView } from 'server/courseInstance/MultiYearPlanInstanceView.entity';
import { SemesterModule } from 'server/semester/semester.module';
import { Course } from 'server/course/course.entity';
import { ConfigService } from 'server/config/config.service';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { CourseInstanceService } from './courseInstance.service';
import { CourseInstanceController } from './courseInstance.controller';
import { ScheduleBlockView } from './ScheduleBlockView.entity';
import { ScheduleEntryView } from './ScheduleEntryView.entity';
import { CourseInstance } from './courseinstance.entity';
import { Faculty } from '../faculty/faculty.entity';
import { FacultyCourseInstance } from './facultycourseinstance.entity';
import { CourseInstanceListingView } from './CourseInstanceListingView.entity';
import { RoomScheduleBlockView } from './RoomScheduleBlockView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseInstance,
      CourseListingView,
      Faculty,
      FacultyCourseInstance,
      MultiYearPlanInstanceView,
      MultiYearPlanView,
      ScheduleBlockView,
      ScheduleEntryView,
      CourseInstanceListingView,
      SemesterView,
      RoomScheduleBlockView,
    ]),
    SemesterModule,
  ],
  providers: [
    CourseInstanceService,
    ConfigService,
  ],
  controllers: [CourseInstanceController],
  exports: [
    CourseInstanceService,
    TypeOrmModule,
  ],
})
export class CourseInstanceModule { }
