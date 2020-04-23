import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from './faculty.entity';

export class FacultyService {
  @InjectRepository(Faculty)
  private readonly facultyRepository: Repository<Faculty>;

  /**
   * Retrieve all faculty members in the database with their associated area,
   * sorted by:
   * - area.name ASC
   *   - lastName ASC
   *   - firstName ASC
   * order
   */
  public async find(): Promise<Faculty[]> {
    return this.facultyRepository.createQueryBuilder(Faculty.name.toLowerCase())
      .leftJoinAndSelect('faculty.area', 'area')
      .orderBy('area.name', 'ASC')
      .addOrderBy('faculty.lastName', 'ASC')
      .addOrderBy('faculty.firstName', 'ASC')
      .getMany();
  }
}
