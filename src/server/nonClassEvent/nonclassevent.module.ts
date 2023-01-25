import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NonClassParent } from 'server/nonClassEvent/nonclassparent.entity';
import { Area } from 'server/area/area.entity';
import { LocationModule } from 'server/location/location.module';
import { SemesterModule } from 'server/semester/semester.module';
import { MeetingModule } from 'server/meeting/meeting.module';
import { NonClassEventController } from './nonClassEvent.controller';
import { NonClassEventService } from './nonClassEvent.service';
import { NonClassEvent } from './nonclassevent.entity';
import { NonClassParentView } from './NonClassParentView.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Area,
      NonClassParent,
      NonClassEvent,
      NonClassParentView,
      NonClassEventView,
    ]),
    forwardRef(() => SemesterModule),
    forwardRef(() => MeetingModule),
    LocationModule,
  ],
  providers: [
    NonClassEventService,
  ],
  controllers: [
    NonClassEventController,
  ],
  exports: [TypeOrmModule],
})
export class NonClassEventModule { }
