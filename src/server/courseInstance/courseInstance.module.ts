import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { MultiYearPlanInstanceView } from 'server/courseInstance/MultiYearPlanInstanceView.entity';
import { SemesterModule } from 'server/semester/semester.module';
import { SemesterService } from 'server/semester/semester.service';
import { Course } from 'server/course/course.entity';
import { ConfigService } from 'server/config/config.service';
import { CourseInstanceService } from './courseInstance.service';
import { CourseInstanceController } from './courseInstance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseListingView,
      MultiYearPlanInstanceView,
      MultiYearPlanView,
    ]),
    SemesterModule,
  ],
  providers: [
    SemesterService,
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
