import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogService } from 'server/log/log.service';
import { Semester } from 'server/semester/semester.entity';
import { SemesterService } from './semester.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Semester]),
  ],
  providers: [
    SemesterService,
    LogService,
  ],
  exports: [SemesterService, TypeOrmModule],
})
export class SemesterModule { }
