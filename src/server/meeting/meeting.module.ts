import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from '../semester/semester.entity';
import { Room } from '../location/room.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';
import { MeetingController } from './meeting.controller';
import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';
import { LocationModule } from '../location/location.module';
import { MeetingListingView } from './MeetingListingView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseInstance,
      Meeting,
      NonClassEvent,
      Room,
      Semester,
      MeetingListingView,
    ]),
    LocationModule,
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [
    MeetingService,
    TypeOrmModule,
  ],
})
export class MeetingModule { }
