import { Module } from '@nestjs/common';
import { ManageFaculty } from './faculty.controller';

@Module({
  controllers: [ManageFaculty],
})
export class FacultyModule {

}
