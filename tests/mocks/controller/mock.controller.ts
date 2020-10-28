import {
  Controller, Get, Post, Put, Delete, UseGuards,
} from '@nestjs/common';
import * as dummy from 'testData';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { Authentication } from 'server/auth/authentication.guard';

/**
 * A fake controller to test different request methods and responses where the
 * data itself doesn't matter
 */

@Controller('api/mock')
export class MockController {
  @Get('/auth')
  @UseGuards(Authentication)
  public getAuthRoute(): void { }

  @Get('/multiple')
  public getAllCourses(): CourseInstanceResponseDTO[] {
    return [
      dummy.cs50CourseInstance,
      dummy.ac209aCourseInstance,
    ];
  }

  @Get('/one')
  public getArrayOfOneCourse(): CourseInstanceResponseDTO[] {
    return [dummy.cs50CourseInstance];
  }

  @Get('/:id')
  public getOneCourse(): CourseInstanceResponseDTO {
    return dummy.cs50CourseInstance;
  }

  @Put('/')
  public updateCourse(): CourseInstanceResponseDTO {
    return dummy.cs50CourseInstance;
  }

  @Post('/')
  public addCourse(): CourseInstanceResponseDTO {
    return dummy.cs50CourseInstance;
  }

  @Delete('/')
  public deleteCourse(): CourseInstanceResponseDTO {
    return dummy.cs50CourseInstance;
  }
}
