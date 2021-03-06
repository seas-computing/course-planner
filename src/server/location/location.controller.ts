import {
  Controller, Get, UseGuards, Query, Inject,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { Authentication } from 'server/auth/authentication.guard';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomRequest from 'common/dto/room/RoomRequest.dto';
import { LocationService } from './location.service';

@ApiTags('Rooms')
@Controller('api/rooms')
@ApiForbiddenResponse({
  description: 'The user is not authenticated',
})
@ApiUnauthorizedResponse({
  description: 'The user is authenticated, but lacks the permissions to access this endpoint',
})
@UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
export class LocationController {
  @Inject(LocationService)
  private readonly locationService: LocationService;

  @Get('/')
  @ApiOperation({ summary: 'Retrieve all rooms from the database along with the meetings that take place in them' })
  @ApiOkResponse({
    type: RoomResponse,
    description: 'An array of all rooms along with the meetings, if any, occurring at the requested time period',
    isArray: true,
  })
  public async getRoomAvailability(@Query() roomInfo: RoomRequest)
    : Promise<RoomResponse[]> {
    return this.locationService.getRooms(roomInfo);
  }
}
