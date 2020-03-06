import { Campus } from 'server/location/campus.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BasePopulationService } from './base.population';
import { campuses } from './data';

export class CampusPopulationService extends BasePopulationService<Campus> {
  @InjectRepository(Campus)
  protected repository: Repository<Campus>;

  public async populate() {
    return this.repository.save(
      campuses.map((name) => {
        const campus = new Campus();
        campus.name = name;
        return campus;
      })
    );
  }
}
