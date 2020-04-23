import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { Faculty } from './faculty.entity';
import { FacultyScheduleView } from './FacultyScheduleView.entity';

export class FacultyScheduleService {
  @InjectRepository(Faculty)
  private readonly facultyRepository: Repository<Faculty>;

  @InjectRepository(FacultyScheduleView)
  private readonly facultyViewRepository: Repository<FacultyScheduleView>;

  public async getAll(): Promise<FacultyResponseDTO[]> {
    return await this.facultyRepository
      .createQueryBuilder('faculty')
      .leftJoinAndMapMany(
        'faculty.'
      )
    
  }
}

