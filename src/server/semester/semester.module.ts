import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from 'server/semester/semester.entity';
import { SemesterService } from './semester.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Semester]),
  ],
  providers: [SemesterService],
  exports: [SemesterService, TypeOrmModule],
})
export class SemesterModule { }
