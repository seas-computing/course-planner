import {
  Controller,
  Put,
  Inject,
  Body,
} from '@nestjs/common';
import MeetingRequestDTO from 'common/dto/meeting/MeetingRequest.dto';
import MeetingResponseDTO from 'common/dto/meeting/MeetingResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingService } from './meeting.service';
import { RoomListingView } from '../location/RoomListingView.entity';

/**
 * API routes for managing meetings
 */

@Controller('api/meetings')
export class MeetingController {
  @Inject(MeetingService)
  private readonly meetingService: MeetingService;

  @InjectRepository(RoomListingView)
  private readonly roomListingRepository: Repository<RoomListingView>;

  /**
   * Provides a single route for creating and updating meetings
   */
  @Put('/')
  public async createOrUpdateMeeting(
    @Body() data: MeetingRequestDTO
  ): Promise<MeetingResponseDTO> {
    let response: MeetingResponseDTO;
    let room: RoomListingView;

    const saved = await this.meetingService.saveMeeting(data);

    // Our [[MeetingResponseDTO]] expects a richer room object that includes
    // the [[Campus]] and [[Building]]/[[Room]] concatenated name. It is legal
    // to create a [[Meeting]] without an associated room, so the fallback returns
    // a meeting with `room: undefined`
    if (saved.room) {
      room = await this.roomListingRepository
        .findOne(response.room.id);
    }
    return {
      ...saved,
      room,
    };
  }
}
