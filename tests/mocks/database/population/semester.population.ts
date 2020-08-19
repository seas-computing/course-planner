import { Semester } from 'server/semester/semester.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasePopulationService } from './base.population';
import { SemesterData } from './data';

export class SemesterPopulationService extends BasePopulationService<Semester> {
  @InjectRepository(Semester)
  protected repository: Repository<Semester>;

  public async populate(
    { semesters }: { semesters: SemesterData[] }
  ): Promise<Semester[]> {
    return this.repository.save(
      semesters.map(({ academicYear, term }) => {
        const semester = new Semester();
        semester.term = term;
        semester.academicYear = academicYear.toString();
        return semester;
      })
    );
  }

  public async drop(): Promise<void> {
    await this.repository.query('TRUNCATE TABLE semester CASCADE;');
  }
}
