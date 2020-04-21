import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from './faculty.entity';

export class FacultyService {
  @InjectRepository(Faculty)
  private readonly facultyRepository: Repository<Faculty>;

  public async find(options?: FindManyOptions): Promise<Faculty[]> {
    return this.facultyRepository.find(options);
  }
}
