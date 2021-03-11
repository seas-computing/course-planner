import {
  Controller,
  Put,
  Inject,
  Body,
} from '@nestjs/common';
import MeetingRequestDTO from 'common/dto/meeting/MeetingRequest.dto';
import MeetingResponseDTO from 'common/dto/meeting/MeetingResponse.dto';
import { MeetingService } from './meeting.service';

@Controller('api/meetings')
export class MeetingController {
  @Inject(MeetingService)
  private readonly meetingService: MeetingService;

  @Put('/')
  public async createOrUpdateMeeting(
    @Body() data: MeetingRequestDTO
  ): Promise<MeetingResponseDTO> {
    return this.meetingService.saveMeeting(data);
  }
}
