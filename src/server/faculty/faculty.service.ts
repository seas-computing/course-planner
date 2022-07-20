import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { NotFoundException } from '@nestjs/common';
import { Absence } from 'server/absence/absence.entity';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';
import { AbsenceRequestDTO } from 'common/dto/faculty/AbsenceRequest.dto';
import { Faculty } from './faculty.entity';
import { InstructorResponseDTO } from '../../common/dto/courses/InstructorResponse.dto';

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

  public async updateFacultyAbsences(absenceInfo: AbsenceRequestDTO):
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
    const filteredAbsence: Absence = existingAbsence.faculty.absences
      .find((absence) => absence.id === existingAbsence.id);
    let absenceYear = Number(filteredAbsence.semester.academicYear);
    if (filteredAbsence.semester.term === 'FALL') {
      absenceYear += 1;
    }
    // Update the absences, FALL will not be updated.
    const futureAbsences = existingAbsence.faculty.absences.map((absence) => {
      if (Number(absence.semester.academicYear) >= absenceYear) {
        return { ...absence, type: absenceInfo.type };
      }
      return { ...absence };
    });
    const savefaculty = await this.facultyRepository.save({
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
