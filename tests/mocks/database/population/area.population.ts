import { Area } from 'server/area/area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { areas } from './data';
import { BasePopulationService } from './base.population';

export class AreaPopulationService extends BasePopulationService<Area> {
  @InjectRepository(Area)
  protected repository: Repository<Area>;

  public async populate() {
    return this.repository.save(areas
      .map((name) => {
        const area = new Area();
        area.name = name;
        return area;
      }));
  }

  public async drop() {
    return this.repository.query('TRUNCATE TABLE area CASCADE;');
  }
}
