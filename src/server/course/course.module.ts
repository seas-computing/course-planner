import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { Course } from './course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
    ]),
  ],
  controllers: [CourseController],
  providers: [
  ],
})
export class CourseModule { }
