import { Controller, Get } from '@nestjs/common';
import { ManageCourseResponseDTO } from 'common/dto/courses/manageCourse.dto';
import { Course } from './course.entity';

@Controller('course')
export class CourseController {
  @Get('/')
  public async index(): Promise<any> {
    
  }
}
