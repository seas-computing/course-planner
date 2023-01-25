import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Absence } from 'server/absence/absence.entity';
import { CourseInstanceModule } from 'server/courseInstance/courseInstance.module';
import { NonClassEventModule } from 'server/nonClassEvent/nonclassevent.module';
import { LogModule } from 'server/log/log.module';
import { Semester } from 'server/semester/semester.entity';
import { SemesterService } from './semester.service';
import { ConfigModule } from '../config/config.module';
import { SemesterView } from './SemesterView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SemesterView,
      Semester,
      Absence,
    ]),
    LogModule,
    ConfigModule,
    forwardRef(() => CourseInstanceModule),
    NonClassEventModule,
  ],
  providers: [
    SemesterService,
  ],
  exports: [SemesterService, TypeOrmModule],
})
export class SemesterModule { }
