import { Faculty } from 'server/faculty/faculty.entity';
import { Area } from 'server/area/area.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BasePopulationService } from './base.population';
import { faculty } from './data';

/**
 * Service for populating/depopulating the faculty table
 */

export class FacultyPopulationService extends BasePopulationService<Faculty> {
  @InjectRepository(Faculty)
  protected repository: Repository<Faculty>;

  @InjectRepository(Area)
  protected areaRepository: Repository<Area>;


  /**
   * Load the test data for faculty into the database
   */
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

  /**
   * remove all the faculty entries from the table
   */
  public async drop() {
    return this.repository.query('TRUNCATE TABLE faculty CASCADE;');
  }
}
