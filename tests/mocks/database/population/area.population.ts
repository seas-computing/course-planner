import { Area } from 'server/area/area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BasePopulationService } from './base.population';
import { AreaData } from './data';

/**
 * Populates all of the areas in the database.
 */
export class AreaPopulationService extends BasePopulationService<Area> {
  @InjectRepository(Area)
  protected repository: Repository<Area>;

  public async populate({ areas }: { areas: AreaData[] }): Promise<Area[]> {
    return this.repository.save(areas
      .map(({ name }) => {
        const area = new Area();
        area.name = name;
        return area;
      }));
  }

  public async drop(): Promise<void> {
    await this.repository.query('TRUNCATE TABLE area CASCADE;');
  }
}
