import { Room } from 'server/location/room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from 'server/location/building.entity';
import { BasePopulationService } from './base.population';

export class RoomPopulationService extends BasePopulationService<Room> {
  @InjectRepository(Room)
  protected repository: Repository<Room>;

  @InjectRepository(Building)
  protected buildingRepository: Repository<Building>

  public async populate() {
    const buildings = await this.buildingRepository.find(
      {
        order: {
          name: 'ASC',
        },
      }
    );

    const randomRoom = (): string => {
      const name = [
        Math.ceil(Math.random() * 5).toString(),
        Math.floor(Math.random() * 100).toString(),
      ];
      if (Math.random() > 0.8) {
        name.push(['A', 'B', 'C'][Math.floor(Math.random() * 3)]);
      }
      if (Math.random() > 0.9) {
        name.unshift(['G', 'B'][Math.floor(Math.random() * 2)]);
      }
      return name.join('');
    };

    return this.repository.save(
      buildings.reduce(
        (list: Room[], building: Building): Room[] => list.concat(
          Array(5).map(
            (): Room => {
              const room = new Room();
              room.name = randomRoom();
              room.building = building;
              return room;
            }
          )
        ), [] as Room[]
      )
    );
  }
}
