import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigService } from 'server/config/config.service';
import { AreaService } from 'server/area/area.service';
import { SemesterService } from 'server/semester/semester.service';
import { Semester } from 'server/semester/semester.entity';
import { Area } from 'server/area/area.entity';
import { CourseService } from 'server/course/course.service';
import { Course } from 'server/course/course.entity';
import { CourseInstanceService } from 'server/courseInstance/courseInstance.service';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { CourseInstanceListingView } from 'server/courseInstance/CourseInstanceListingView.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { ScheduleBlockView } from 'server/courseInstance/ScheduleBlockView.entity';
import { ScheduleEntryView } from 'server/courseInstance/ScheduleEntryView.entity';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Semester,
      Area,
      Course,
      CourseListingView,
      CourseInstance,
      CourseInstanceListingView,
      Faculty,
      FacultyCourseInstance,
      MultiYearPlanView,
      ScheduleBlockView,
      ScheduleEntryView,
      SemesterView,
    ]),
  ],
  controllers: [MetadataController],
  providers: [
    ConfigService,
    AreaService,
    SemesterService,
    CourseService,
    CourseInstanceService,
  ],
})
export class MetadataModule { }
