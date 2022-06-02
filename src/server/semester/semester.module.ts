import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absence } from 'server/absence/absence.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { LogModule } from 'server/log/log.module';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Semester } from 'server/semester/semester.entity';
import { SemesterService } from './semester.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Semester,
      CourseInstance,
      NonClassEvent,
      Absence,
    ]),
    LogModule,
    ConfigModule,
  ],
  providers: [
    SemesterService,
  ],
  exports: [SemesterService, TypeOrmModule],
})
export class SemesterModule { }
