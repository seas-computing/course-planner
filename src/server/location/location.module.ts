import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomBookingInfoView } from './RoomBookingInfoView.entity';
import { LocationService } from './location.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomBookingInfoView,
    ]),
  ],
  controllers: [],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule { }
