import {
  Controller, Get, UseGuards, Body, Inject,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUseTags,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { Authentication } from 'server/auth/authentication.guard';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomRequest from 'common/dto/room/RoomRequest.dto';
import { RoomService } from './room.service';

@ApiUseTags('Rooms')
@Controller('api/rooms')
@ApiForbiddenResponse({
  description: 'The user is not authenticated',
})
@ApiUnauthorizedResponse({
  description: 'The user is authenticated, but lacks the permissions to access this endpoint',
})
@UseGuards(Authentication, new RequireGroup(GROUP.ADMIN))
export class RoomController {
  @Inject(RoomService)
  private readonly roomService: RoomService;

  @Get('/')
  @ApiOperation({ title: 'Retrieve all rooms from the database along with the meetings that take place in them' })
  @ApiOkResponse({
    type: RoomResponse,
    description: 'An array of all rooms along with the meetings, if any, occurring at the requested time period',
    isArray: true,
  })
  public async getRoomAvailability(@Body() roomInfo: RoomRequest)
    : Promise<RoomResponse[]> {
    return this.roomService.getRooms(roomInfo);
  }
}
