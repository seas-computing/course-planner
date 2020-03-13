import { Room } from 'server/location/room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from 'server/location/building.entity';
import { Campus } from 'server/location/campus.entity';
import { BasePopulationService } from './base.population';
import { CampusData, BuildingData, RoomData } from './data';

/**
 * Populates campuses, buildings and rooms in the database.
 */
export class RoomPopulationService extends BasePopulationService<Room> {
  @InjectRepository(Room)
  protected repository: Repository<Room>;

  @InjectRepository(Building)
  protected buildingRepository: Repository<Building>

  @InjectRepository(Campus)
  protected campusRepository: Repository<Campus>

  public async populate({ buildings, campuses, rooms }: {
    buildings: BuildingData[];
    campuses: CampusData[];
    rooms: RoomData[];
  }): Promise<Room[]> {
    const campusList = await this.campusRepository
      .save(
        campuses.map(
          ({ name }): Campus => {
            const campus = new Campus();
            campus.name = name;
            return campus;
          }
        )
      );
    const buildingList = await this.buildingRepository
      .save(
        buildings.map(({ name, campus }): Building => {
          const building = new Building();
          building.name = name;
          building.campus = campusList.find(
            ({ name: cname }) => cname === campus
          );
          return building;
        })
      );
    return this.repository.save(
      rooms.map(({ name, building, capacity }): Room => {
        const room = new Room();
        room.name = name;
        room.capacity = capacity;
        room.building = buildingList.find(
          ({ name: bname }) => bname === building
        );
        return room;
      })
    );
  }

  public async drop() {
    await this.repository.query('TRUNCATE TABLE room CASCADE;');
    await this.repository.query('TRUNCATE TABLE building CASCADE;');
    return this.repository.query('TRUNCATE TABLE campus CASCADE;');
  }
}
