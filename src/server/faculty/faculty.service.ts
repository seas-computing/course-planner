import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from './faculty.entity';
import { InstructorResponseDTO } from '../../common/dto/courses/InstructorResponse.dto';

import { Absence } from 'server/absence/absence.entity';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';
import { AbsenceRequestDTO } from 'common/dto/faculty/AbsenceRequest.dto';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { NotFoundException } from '@nestjs/common'
import { int } from 'testData';

export class FacultyService {
  @InjectRepository(Faculty)
  private readonly facultyRepository: Repository<Faculty>;

  @InjectRepository(Absence)
  private absenceRepository: Repository<Absence>;
  
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

  /**
   * Retieves just the id and displayName of each faculty member in the system,
   * for populating the interface to add instructors to a course
   */
  public async getInstructorList(): Promise<InstructorResponseDTO[]> {
    return this.facultyRepository
      .createQueryBuilder()
      .select('id')
      .addSelect('CONCAT_WS(\', \', "lastName", "firstName")', 'displayName')
      .orderBy('"displayName"')
      .getRawMany();
  }


  public async updateFacultyAbsence( absenceInfo: AbsenceRequestDTO):
  Promise<AbsenceResponseDTO> {
    let existingAbsence: Absence;
    try {
      existingAbsence = await this.absenceRepository
        .findOneOrFail({
          relations: [
            'faculty',
            'faculty.absences',
            'faculty.absences.semester',
          ],
          where: {
            id: absenceInfo.id,
          },
        });
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('The entered Absence does not exist');
      }
      throw e;
    }

    // Get the absence year to update the absence of the following years accordingly.
    // If FALL chosen then start from the next year
    let filteredAbsence: Absence = existingAbsence.faculty.absences
      .find(absence => absence.id === existingAbsence.id);
    let absenceYear =  Number(filteredAbsence.semester.academicYear);
    if (filteredAbsence.semester.term == 'FALL') {
      absenceYear = absenceYear + 1;
    }

    // Update the absences, FALL will not be updated. 
    let futureAbsences = existingAbsence.faculty.absences
      .map(absence => {
        return (Number(absence.semester.academicYear) >= absenceYear)
        ? {...absence, type: absenceInfo.type}
        : {...absence}
      })

    await this.facultyRepository.save({
      id: existingAbsence.faculty.id,
      absences: futureAbsences,
    });

    // This will update FALL term.
    // If SPRING term chosen then this will re update the spring
    const validAbsence = {
      ...absenceInfo,
      id: existingAbsence.id,
    };

    return this.absenceRepository.save(validAbsence);
  }

}
