import {
  Controller, Get, UseGuards, Query, Inject, Post, Body, NotFoundException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RequireGroup } from 'server/auth/group.guard';
import { GROUP } from 'common/constants';
import { Authentication } from 'server/auth/authentication.guard';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomRequest from 'common/dto/room/RoomRequest.dto';
import RoomMeetingResponse from 'common/dto/room/RoomMeetingResponse.dto';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import { CreateRoomRequest } from 'common/dto/room/CreateRoomRequest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { LocationService } from './location.service';
import { Campus } from './campus.entity';
import { Building } from './building.entity';

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

  @InjectRepository(Campus)
  private readonly campusRepository: Repository<Campus>;

  @InjectRepository(Building)
  private readonly buildingRepository: Repository<Building>;

  @Get('/')
  @ApiOperation({ summary: 'Retrieve Room Data' })
  @ApiOkResponse({
    type: RoomResponse,
    description: 'An array of the existing rooms along with their building and campus information',
    isArray: true,
  })
  public async getRooms(): Promise<RoomResponse[]> {
    return this.locationService.getRoomList();
  }

  @Get('/availability')
  @ApiOperation({ summary: 'Retrieve all rooms from the database along with the meetings that take place in them' })
  @ApiOkResponse({
    type: RoomMeetingResponse,
    description: 'An array of all rooms along with the meetings, if any, occurring at the requested time period',
    isArray: true,
  })
  public async getRoomAvailability(@Query() roomInfo: RoomRequest)
    : Promise<RoomMeetingResponse[]> {
    return this.locationService.getRoomAvailability(roomInfo);
  }

  @Get('/admin')
  @ApiOperation({ summary: 'Retrieve all room names and corresponding building and campus data' })
  @ApiOkResponse({
    type: RoomAdminResponse,
    description: 'An array of all room names and corresponding building and campus data',
    isArray: true,
  })
  public async getFullRoomList(): Promise<RoomAdminResponse[]> {
    return this.locationService.getFullRoomList();
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new room in the database' })
  @ApiOkResponse({
    type: RoomAdminResponse,
    description: 'An object with the newly created room information.',
    isArray: false,
  })
  @ApiNotFoundResponse({
    description: 'Not Found: The requested campus/building entities could not be found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request: the request is not in accordance with the createFaculty DTO',
  })
  public async create(
    @Body() room: CreateRoomRequest
  ): Promise<RoomAdminResponse> {
    try {
      const results = await this.locationService.createRoom(room);
      return results;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
