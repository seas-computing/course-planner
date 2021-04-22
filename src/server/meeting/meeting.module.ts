import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RoomBookingInfoView } from 'server/location/RoomBookingInfoView.entity';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomListingView,
      RoomBookingInfoView,
    ]),
  ],
  controllers: [RoomController],
  providers: [
    RoomService,
  ],
})
export class MeetingModule { }
