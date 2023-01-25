import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Area } from 'server/area/area.entity';
import { CourseController } from './course.controller';
import { Course } from './course.entity';
import { CourseService } from './course.service';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    SemesterModule,
    TypeOrmModule.forFeature([
      Course,
      Area,
    ]),
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
  ],
})
export class CourseModule { }
