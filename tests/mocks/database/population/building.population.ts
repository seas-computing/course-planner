import { Building } from 'server/location/building.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Campus } from 'server/location/campus.entity';
import { allstonBuildings, cambridgeBuildings } from './data';
import { BasePopulationService } from './base.population';

export class BuildingPopulationService extends BasePopulationService<Building> {
  @InjectRepository(Building)
  protected repository: Repository<Building>;

  @InjectRepository(Campus)
  protected campusRepository: Repository<Campus>

  public async populate() {
    const [allston, cambridge] = await Promise.all([
      this.campusRepository.findOne(
        {
          where: {
            name: 'Allston',
          },
        }
      ),
      this.campusRepository.findOne(
        {
          where: {
            name: 'Cambridge',
          },
        }
      ),
    ]);
    return this.repository.save([
      ...(cambridgeBuildings.map((name) => {
        const building = new Building();
        building.name = name;
        building.campus = cambridge;
        return building;
      })),
      ...(allstonBuildings.map((name) => {
        const building = new Building();
        building.name = name;
        building.campus = allston;
        return building;
      })),
    ]);
  }
}
