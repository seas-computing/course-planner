import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SemesterModule } from 'server/semester/semester.module';
import { CourseInstanceModule } from 'server/courseInstance/courseInstance.module';
import { NonClassEventModule } from '../nonClassEvent/nonclassevent.module';
import { MeetingController } from './meeting.controller';
import { Meeting } from './meeting.entity';
import { MeetingService } from './meeting.service';
import { LocationModule } from '../location/location.module';
import { MeetingListingView } from './MeetingListingView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      MeetingListingView,
    ]),
    LocationModule,
    forwardRef(() => SemesterModule),
    CourseInstanceModule,
    forwardRef(() => NonClassEventModule),
  ],
  controllers: [MeetingController],
  providers: [MeetingService],
  exports: [
    MeetingService,
    TypeOrmModule,
  ],
})
export class MeetingModule { }
