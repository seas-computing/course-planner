import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from 'server/course/course.module';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { MultiYearPlanInstanceView } from 'server/courseInstance/MultiYearPlanInstanceView.entity';
import { SemesterModule } from 'server/semester/semester.module';
import { ConfigService } from 'server/config/config.service';
import { LocationModule } from 'server/location/location.module';
import { FacultyModule } from 'server/faculty/faculty.module';
import { CourseInstanceService } from './courseInstance.service';
import { CourseInstanceController } from './courseInstance.controller';
import { ScheduleBlockView } from './ScheduleBlockView.entity';
import { ScheduleEntryView } from './ScheduleEntryView.entity';
import { CourseInstance } from './courseinstance.entity';
import { FacultyCourseInstance } from './facultycourseinstance.entity';
import { CourseInstanceListingView } from './CourseInstanceListingView.entity';
import { RoomScheduleBlockView } from './RoomScheduleBlockView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseInstance,
      CourseListingView,
      FacultyCourseInstance,
      MultiYearPlanInstanceView,
      MultiYearPlanView,
      ScheduleBlockView,
      ScheduleEntryView,
      CourseInstanceListingView,
      RoomScheduleBlockView,
    ]),
    forwardRef(() => CourseModule),
    forwardRef(() => SemesterModule),
    LocationModule,
    FacultyModule,
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
