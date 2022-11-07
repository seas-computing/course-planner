import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityNotFoundError, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomListingView } from 'server/location/RoomListingView.entity';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import RoomRequest from 'common/dto/room/RoomRequest.dto';
import RoomMeetingResponse from 'common/dto/room/RoomMeetingResponse.dto';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import { CampusResponse } from 'common/dto/room/CampusResponse.dto';
import { RoomBookingInfoView } from './RoomBookingInfoView.entity';
import { Room } from './room.entity';
import { Campus } from './campus.entity';
import { CreateRoomRequest } from 'common/dto/room/CreateRoomRequest.dto';
import { Building } from './building.entity';

/**
 * A service for managing room, building, and campus entities in the database.
 */

export interface Booking {
  roomId: string;
  roomName: string;
  meetingTitles: string[];
}

interface RoomQueryResult {
  id: string;
  campus: string;
  name: string;
  capacity: number;
  meetings: string[];
}

@Injectable()
export class LocationService {
  @InjectRepository(RoomListingView)
  private readonly roomListingViewRepository: Repository<RoomListingView>;

  @InjectRepository(RoomBookingInfoView)
  private readonly roomBookingRepository: Repository<RoomBookingInfoView>;

  @InjectRepository(Room)
  private roomRepository: Repository<Room>;

  @InjectRepository(Campus)
  private campusRepository: Repository<Campus>;

  @InjectRepository(Building)
  private buildingRepository: Repository<Building>;

  /**
   * Retrieves all rooms in the database along with their campus and capacity
   * information.
   */
  public async getRoomList(): Promise<RoomResponse[]> {
    return this.roomListingViewRepository
      .find({
        select: ['id', 'name', 'campus', 'capacity'],
      });
  }

  /**
   * Queries the view of room booking info in our database for any existing
   * bookings that might overlap with the meeting represented by the data in
   * the details argument. Returns true when there are no conflicts, and false
   * when there is a conflict
   */

  public async getRoomBookings(
    details: Partial<RoomBookingInfoView>
  ): Promise<Booking[]> {
    const {
      roomId,
      calendarYear,
      term,
      day,
      startTime,
      endTime,
      parentId,
    } = details;

    return this.roomBookingRepository
      .createQueryBuilder()
      .select('"roomId"')
      .addSelect('array_agg("meetingTitle")', 'meetingTitles')
      .addSelect('"roomName"')
      .groupBy('"roomId"')
      .addGroupBy('"roomName"')
      .addGroupBy('"calendarYear"')
      .addGroupBy('term')
      .addGroupBy('day')
      .where('"roomId"=:roomId', { roomId })
      .andWhere('"parentId"!=:parentId', { parentId })
      .andWhere('term=:term', { term })
      .andWhere('"calendarYear"=:calendarYear', { calendarYear })
      .andWhere('day=:day', { day })
      .andWhere(
        '(:startTime::TIME, :endTime::TIME) OVERLAPS ("startTime", "endTime")',
        { startTime, endTime }
      )
      .getRawMany();
  }

  /**
   * Resolves with a list of rooms and the course instance and/or non class
   * meetings that are scheduled to occur during the requested calendar year,
   * term, day, start time, and end time.
   *
   * If the RoomRequest data includes an `excludeParent` property with the UUID
   * of a [[CourseInstance]] or [[NonClassEvent]], it will not show that
   * meeting in the list of meetings. This is mostly necessary when populating
   * the [[RoomSelectionTable]] on the client, so that users can change the
   * room associated with a meeting then change it back. It's implemented on
   * the server so that we can strictly compare by UUID, not by the
   * (potentially not unique) meeting title string.
   */
  public async getRoomAvailability(
    {
      excludeParent,
      ...roomInfo
    }: RoomRequest
  ): Promise<RoomMeetingResponse[]> {
    const roomQuery = this.roomListingViewRepository
      .createQueryBuilder('r')
      .leftJoin((qb) => {
        const subQuery = qb
          .select('"meetingTitle"')
          .addSelect('"roomId"')
          .from(RoomBookingInfoView, 'b')
          .where('"calendarYear" = :calendarYear')
          .andWhere('term = :term')
          .andWhere('day = :day')
          .andWhere('("startTime", "endTime") OVERLAPS (:startTime::TIME, :endTime::TIME)');
        if (excludeParent) {
          subQuery.andWhere('"parentId" <> :excludeParent', { excludeParent });
        }
        return subQuery.setParameters(roomInfo);
      }, 'b', 'r.id = b."roomId"')
      .select('r.id', 'id')
      .addSelect('r.campus', 'campus')
      .addSelect('r.name', 'name')
      .addSelect('r.capacity', 'capacity')
      .addSelect('array_agg("b"."meetingTitle")', 'meetings')
      .groupBy('r.id')
      .addGroupBy('r.campus')
      .addGroupBy('r.name')
      .addGroupBy('r.capacity')
      .orderBy('r.campus', 'ASC')
      .addOrderBy('r.name', 'ASC');
    const result = await roomQuery
      .getRawMany();
    return result.map(({ meetings, ...row }: RoomQueryResult) => ({
      ...row,
      meetingTitles: meetings
        .filter((title) => !!title),
    }));
  }

  /**
   * Resolves with a list of rooms along with their associated campus and
   * building information.
   */
  public async getFullRoomList(): Promise<RoomAdminResponse[]> {
    return this.roomRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect(
        'r.building',
        'building'
      )
      .leftJoinAndSelect(
        'building.campus',
        'campus'
      )
      .orderBy('campus.name', 'ASC')
      .addOrderBy('building.name', 'ASC')
      .addOrderBy('r.name', 'ASC')
      .getMany() as Promise<RoomAdminResponse[]>;
  }

  /**
   * Returns a list of campuses along with their building and room information.
   */
  public async getCampusMetadata(): Promise<CampusResponse[]> {
    return await this.campusRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect(
        'c.buildings',
        'b'
      )
      .leftJoinAndSelect(
        'b.rooms',
        'r'
      )
      .orderBy('c.name', 'ASC')
      .addOrderBy('b.name', 'ASC')
      .addOrderBy('r.name', 'ASC')
      .getMany() as CampusResponse[];
  }

  /**
   * Creates a new room after validating that the provided campus exists, that
   * the building does not exist within another campus, and that the room
   * requested does not already exist.
   */
  public async createRoom(room: CreateRoomRequest):
  Promise<Room> {
    let campus: Campus;
    try {
      campus = await this.campusRepository.findOneOrFail({
        where: {
          name: room.campus
        }
      })
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException(`Unable to find a campus called "${room.campus}".`)
      } else {
        throw e;
      }
    }
    // The user should not be able to to create a building that exists on a
    // different campus, because a building cannot exist on multiple campuses.
    let otherCampuses = await this.campusRepository.find({
      where: {
        name: Not(room.campus)
      },
      relations: ['buildings'],
    })

    otherCampuses.map(otherCampus => otherCampus.buildings.map(building => {
      if (building.name.toLowerCase() === room.building.toLowerCase()) {
        throw new BadRequestException(`${room.building} already exists within another campus.`);
      }
    }));

       // Check that the room being created is not a duplicate of an existing room
      let dbRooms = await this.roomListingViewRepository.createQueryBuilder()
        .where("LOWER(name) = LOWER(:name)", {
          name: `${room.building} ${room.name}`
        })
        .getMany();

      if (dbRooms.length > 0) {
        throw new BadRequestException(`The room ${room.name} already exists in ${room.building}.`);
      }
  
    let building: Partial<Building> = await this.buildingRepository
      .findOne({
        where: {
          name: room.building,
        },
      });
    // If the building doesn't exist yet, it will be created
    // by the cascade insert set on the Room entity.
    if (building == null) {
      building = { name: room.building };
    }

    const roomToCreate = {
      ...room,
      campus,
      building,
    };
    return this.roomRepository.save(roomToCreate);
  }
}
