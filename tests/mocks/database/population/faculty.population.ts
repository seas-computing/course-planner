import { Faculty } from 'server/faculty/faculty.entity';
import { Area } from 'server/area/area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FACULTY_TYPE } from 'common/constants';
import { BasePopulationService } from './base.population';

export class FacultyPopulationService extends BasePopulationService<Faculty> {
  @InjectRepository(Faculty)
  protected Repository: Repository<Faculty>;

  @InjectRepository(Area)
  protected areaRepository: Repository<Area>;

  public async populate() {
    const areas = await this.areaRepository.find(
      {
        order: {
          name: 'ASC',
        },
      }
    );

    return this.repository.save();
  }
}
