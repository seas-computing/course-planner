import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigService } from 'server/config/config.service';
import { AreaService } from 'server/area/area.service';
import { Area } from 'server/area/area.entity';
import { CourseService } from 'server/course/course.service';
import { SemesterModule } from 'server/semester/semester.module';
import { LocationModule } from 'server/location/location.module';
import { CourseModule } from 'server/course/course.module';
import { MetadataController } from './metadata.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Area,
    ]),
    SemesterModule,
    LocationModule,
    CourseModule,
  ],
  controllers: [MetadataController],
  providers: [
    ConfigService,
    AreaService,
    CourseService,
  ],
})
export class MetadataModule { }
