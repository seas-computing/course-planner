import { Faculty } from 'server/faculty/faculty.entity';
import { Area } from 'server/area/area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BasePopulationService } from './base.population';
import { faculty } from './data';

export class FacultyPopulationService extends BasePopulationService<Faculty> {
  @InjectRepository(Faculty)
  protected Repository: Repository<Faculty>;

  @InjectRepository(Area)
  protected areaRepository: Repository<Area>;

  public async populate() {
    const allAreas = await this.areaRepository.find(
      {
        order: {
          name: 'ASC',
        },
      }
    );

    return this.repository.save(faculty.map((facultyData): Faculty => {
      const instructor = new Faculty();
      instructor.firstName = facultyData.firstName;
      instructor.lastName = facultyData.lastName;
      instructor.HUID = facultyData.HUID;
      instructor.jointWith = facultyData.jointWith;
      instructor.category = facultyData.category;
      instructor.area = allAreas.find(
        ({ name }): boolean => name === facultyData.area
      );
      return instructor;
    }));
  }
}
