import {
  Controller,
  Put,
  Inject,
  Body,
  Param,
} from '@nestjs/common';
import { MeetingRequestDTO } from 'common/dto/meeting/MeetingRequest.dto';
import { MeetingResponseDTO } from 'common/dto/meeting/MeetingResponse.dto';
import { MeetingService } from './meeting.service';

/**
 * API routes for managing meetings
 */

@Controller('api/meetings')
export class MeetingController {
  @Inject(MeetingService)
  private readonly meetingService: MeetingService;

  /**
   * Provides a single route for creating and updating a list of meetings for
   * the parent (either a nonClassEvent or a courseIntance) whose id is given
   * in the url parameter. Any meetings that have been removed from the
   * parent's meetings list will be deleted
   */
  @Put('/:parentId')
  public async createOrUpdateMeeting(
    @Body() meetingList: MeetingRequestDTO[],
      @Param('parentId') parentId: string
  ): Promise<MeetingResponseDTO[]> {
    return this.meetingService
      .saveMeetings(
        parentId,
        meetingList
      );
  }
}
