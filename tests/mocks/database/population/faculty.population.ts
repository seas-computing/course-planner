import { Faculty } from 'server/faculty/faculty.entity';
import { Area } from 'server/area/area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BasePopulationService } from './base.population';
import { FacultyData } from './data';

/**
 * Populates the faculty table in the database
 */

export class FacultyPopulationService extends BasePopulationService<Faculty> {
  @InjectRepository(Faculty)
  protected repository: Repository<Faculty>;

  @InjectRepository(Area)
  protected areaRepository: Repository<Area>;

  public async populate(
    { faculty }: { faculty: FacultyData[] }
  ): Promise<Faculty[]> {
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
      instructor.notes = facultyData.notes;
      instructor.category = facultyData.category;
      instructor.area = allAreas.find(
        ({ name }): boolean => name === facultyData.area
      );
      return instructor;
    }));
  }

  public async drop(): Promise<void> {
    await this.repository.query('TRUNCATE TABLE faculty CASCADE;');
  }
}
