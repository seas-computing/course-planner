import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigService } from 'server/config/config.service';
import { AreaService } from 'server/area/area.service';
import { Semester } from 'server/semester/semester.entity';
import { Area } from 'server/area/area.entity';
import { CourseService } from 'server/course/course.service';
import { Course } from 'server/course/course.entity';
import { SemesterModule } from 'server/semester/semester.module';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Semester,
      Area,
      Course,
    ]),
    SemesterModule,
  ],
  controllers: [MetadataController],
  providers: [
    ConfigService,
    AreaService,
    CourseService,
  ],
})
export class MetadataModule { }
