import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from 'server/semester/semester.entity';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { Area } from 'server/area/area.entity';
import { Meeting } from 'server/meeting/meeting.entity';
import { Campus } from 'server/location/campus.entity';
import { Room } from 'server/location/room.entity';
import { Building } from 'server/location/building.entity';
import { NonClassEventController } from './nonClassEvent.controller';
import { NonClassEventService } from './nonClassEvent.service';
import { NonClassEvent } from './nonclassevent.entity';
import { NonClassParentView } from './NonClassParentView.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Area,
      Semester,
      NonClassParent,
      NonClassEvent,
      NonClassParentView,
      NonClassEventView,
      Meeting,
      Room,
      Building,
      Campus,
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
