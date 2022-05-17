import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absence } from 'server/absence/absence.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { LogService } from 'server/log/log.service';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Semester } from 'server/semester/semester.entity';
import { SemesterService } from './semester.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Semester,
      CourseInstance,
      NonClassEvent,
      Absence,
    ]),
  ],
  providers: [
    SemesterService,
    LogService,
  ],
  exports: [SemesterService, TypeOrmModule],
})
export class SemesterModule { }
