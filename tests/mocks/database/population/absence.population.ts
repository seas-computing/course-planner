import { InjectRepository } from '@nestjs/typeorm';
import { Absence } from 'server/absence/absence.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { Semester } from 'server/semester/semester.entity';
import { Repository } from 'typeorm';
import { BasePopulationService } from './base.population';
import { AbsenceData } from './data';

/**
 * Populates the absence table in the database
 */
export class AbsencePopulationService extends BasePopulationService<Absence> {
  @InjectRepository(Absence)
  protected repository: Repository<Absence>;

  @InjectRepository(Faculty)
  protected facultyRepository: Repository<Faculty>;

  @InjectRepository(Semester)
  protected semesterRepository: Repository<Semester>;

  public async populate(
    { absences }: { absences: AbsenceData[] }
  ): Promise<Absence[]> {
    const allFaculty = await this.facultyRepository.find(
      {
        order: {
          HUID: 'ASC',
        },
      }
    );

    const allSemesters = await this.semesterRepository.find(
      {
        order: {
          academicYear: 'ASC',
          term: 'ASC',
        },
      }
    );

    const allAbsences: Absence[] = [];

    absences.forEach((absence) => {
      allSemesters.forEach((sem) => {
        const newAbsence = this.repository.create();
        newAbsence.type = absence.type;
        newAbsence.faculty = allFaculty.find(
          ({ lastName }): boolean => lastName === absence.faculty
        );
        newAbsence.semester = sem;
        allAbsences.push(newAbsence);
      });
    });

    return this.repository.save(allAbsences);
  }

  public async drop(): Promise<void> {
    await this.repository.query('TRUNCATE TABLE absence CASCADE;');
  }
}
