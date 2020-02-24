import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { Course } from './course.entity';
import { CourseService } from './course.service';
import { Semester } from '../semester/semester.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Semester,
      Course,
    ]),
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
  ],
})
export class CourseModule { }
