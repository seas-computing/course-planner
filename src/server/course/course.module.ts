import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { Area } from 'server/area/area.entity';
import { CourseController } from './course.controller';
import { Course } from './course.entity';
import { CourseService } from './course.service';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    forwardRef(() => SemesterModule),
    TypeOrmModule.forFeature([
      Course,
      Area,
    ]),
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
  ],
  exports: [TypeOrmModule],
})
export class CourseModule { }
