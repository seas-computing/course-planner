import { Semester } from 'server/semester/semester.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasePopulationService } from './base.population';
import { semesters } from './data';

export class SemesterPopulationService extends BasePopulationService<Semester> {
  @InjectRepository(Semester)
  protected repository: Repository<Semester>

  public async populate() {
    return this.repository.save(
      semesters.map(({ academicYear, term }) => {
        const semester = new Semester();
        semester.term = term;
        semester.academicYear = academicYear;
        return semester;
      })
    );
  }
}
