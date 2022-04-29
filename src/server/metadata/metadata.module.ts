import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigService } from 'server/config/config.service';
import { AreaService } from 'server/area/area.service';
import { SemesterService } from 'server/semester/semester.service';
import { Semester } from 'server/semester/semester.entity';
import { Area } from 'server/area/area.entity';
import { CourseService } from 'server/course/course.service';
import { Course } from 'server/course/course.entity';
import { LogService } from 'server/log/log.service';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Semester,
      Area,
      Course,
    ]),
  ],
  controllers: [MetadataController],
  providers: [
    ConfigService,
    AreaService,
    SemesterService,
    CourseService,
    LogService,
  ],
})
export class MetadataModule { }
