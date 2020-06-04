import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'server/course/course.entity';
import { Semester } from 'server/semester/semester.entity';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { NonClassEvent } from './nonclassevent.entity';
import { NonClassEventService } from './nonClassEvent.service';
import { Area } from 'server/area/area.entity';
import { NonClassParentView } from './NonClassParentView.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Area,
      Semester,
      Course,
      NonClassParent,
      NonClassEvent,
      NonClassParentView,
      NonClassEventView,
    ]),
  ],
  providers: [
    NonClassEventService,
  ],
  controllers: [
    NonClassEventController,
  ],
  exports: [],
})
export class NonClassEventModule { }
