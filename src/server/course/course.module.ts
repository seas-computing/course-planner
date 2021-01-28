import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Area } from 'server/area/area.entity';
import { Semester } from 'server/semester/semester.entity';
import { CourseController } from './course.controller';
import { Course } from './course.entity';
import { CourseService } from './course.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Semester,
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
