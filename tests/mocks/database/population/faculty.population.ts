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

    const firstNames = [
      'James',
      'Yiling',
      'David',
      'Joanna',
      'Finale',
      'Demba',
      'Na',
    ];

    const lastNames = [
      'Waldo',
      'Parkes',
      'Chen',
      'Aizenberg',
      'Ba',
      'Li',
      'Doshi-Velez',
    ];


    const randomHUID = (): string => (
      Array(8).map((): number => Math.floor(Math.random() * 10)).join('')
    );
    return this.repository.save(
      areas.reduce(
        (list: Faculty[], area: Area): Faculty[] => list.concat(
          Array(2).map((): Faculty => {
            const faculty = new Faculty();
            faculty.firstName = firstNames[
              Math.floor(Math.random() * firstNames.length)
            ];
            faculty.lastName = lastNames[
              Math.floor(Math.random() * lastNames.length)
            ];
            faculty.HUID = randomHUID();
            faculty.category = Object.values(FACULTY_TYPE)[
              Math.floor(Math.random() * Object.values(FACULTY_TYPE).length)
            ];
            faculty.jointWith = '';
            faculty.area = area;
            return faculty;
          })
        ), [] as Faculty[]
      )
    );
  }
}
