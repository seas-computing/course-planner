import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RoomBookingInfoView } from 'server/location/RoomBookingInfoView.entity';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Room } from './room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomListingView,
      RoomBookingInfoView,
      Room,
    ]),
  ],
  controllers: [LocationController],
  providers: [
    LocationService,
  ],
  exports: [
    LocationService,
    TypeOrmModule,
  ],
})
export class LocationModule { }
