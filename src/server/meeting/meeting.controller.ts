import {
  Controller,
  Put,
  Inject,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MeetingRequestDTO } from 'common/dto/meeting/MeetingRequest.dto';
import { MeetingResponseDTO } from 'common/dto/meeting/MeetingResponse.dto';
import {
  ApiUseTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiImplicitBody,
} from '@nestjs/swagger';
import { EntityNotFoundError } from 'typeorm';
import { MeetingService } from './meeting.service';
import { Authentication } from '../auth/authentication.guard';
import { RequireGroup } from '../auth/group.guard';
import { GROUP } from '../../common/constants';
import { RoomConflictException } from '../location/RoomConflict.exception';

/**
 * API routes for managing meetings
 */

@ApiUseTags('Meetings')
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
  @UseGuards(new RequireGroup(GROUP.ADMIN))
  @UseGuards(Authentication)
  @ApiOperation({
    title: 'Create, update, or remove meetings from a course instance or non-class event',
  })
  @ApiOkResponse({
    type: MeetingResponseDTO,
    isArray: true,
    description: 'An array of the meetings now associated with the course instance or non-class event',
  })
  @ApiImplicitBody({
    type: MeetingRequestDTO,
    isArray: true,
    name: 'meetings',
    description: 'An array of meetings that should be associated with the course instance or non-class event specified by the parentId parameter. Any existing meetings associated with the parent that are not included in the request will be removed. An empty array removes all meetings.',
  })
  @ApiUnauthorizedResponse({
    description: 'Thrown if the user is not authenticated',
  })
  @ApiNotFoundResponse({
    description: 'Not Found: The parent id provided does not match a course instance or non-class event',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: The room specified is not available at the requested time',
  })
  @Put('/:parentId')
  public async createOrUpdateMeeting(
    @Body('meetings') meetings: MeetingRequestDTO[],
      @Param('parentId') parentId: string
  ): Promise<MeetingResponseDTO[]> {
    try {
      const savedMeetings = await this.meetingService
        .saveMeetings(
          parentId,
          meetings
        );
      return savedMeetings;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof RoomConflictException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
