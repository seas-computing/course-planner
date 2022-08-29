import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { NotFoundException, Inject } from '@nestjs/common';
import { Absence } from 'server/absence/absence.entity';
import { AbsenceRequestDTO } from 'common/dto/faculty/AbsenceRequest.dto';
import { ABSENCE_TYPE, TERM } from 'common/constants';
import { ConfigService } from 'server/config/config.service';
import { absenceEnumToTitleCase } from 'common/utils/facultyHelperFunctions';
import { Faculty } from './faculty.entity';
import { InstructorResponseDTO } from '../../common/dto/courses/InstructorResponse.dto';

export class FacultyService {
  @InjectRepository(Faculty)
  private readonly facultyRepository: Repository<Faculty>;

  @InjectRepository(Absence)
  private absenceRepository: Repository<Absence>;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

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

  /**
   * Check selecterAcademicYear not in the past
   * @internal
   */
  private check_absence(
    semesterTerm: string,
    selectAcademicYear: number,
    currentAcademicYear: number
  ) :boolean {
    let selecterAcademicYear = selectAcademicYear;
    if (semesterTerm === TERM.FALL) {
      selecterAcademicYear += 1;
    }
    if (selecterAcademicYear < currentAcademicYear) {
      return false;
    }
    return true;
  }

  public async updateFacultyAbsences(
    absenceReqInfo: AbsenceRequestDTO
  ): Promise<Absence> {
    let absenceInfo: AbsenceRequestDTO = { ...absenceReqInfo };
    const existingAbsence = await this.absenceRepository
      .findOne({
        relations: [
          'semester',
          'faculty',
          'faculty.absences',
          'faculty.absences.semester',
        ],
        where: {
          id: absenceReqInfo.id,
        },
      });
    const selectAcademicYear = Number(existingAbsence.semester.academicYear);
    const semesterTerm = existingAbsence.semester.term;
    if (absenceReqInfo.type === ABSENCE_TYPE.NO_LONGER_ACTIVE
      || existingAbsence.type === ABSENCE_TYPE.NO_LONGER_ACTIVE) {
      const validAbsenceYear = this.check_absence(semesterTerm,
        selectAcademicYear, this.configService.academicYear);
      if (!validAbsenceYear) {
        throw new Error(`Can not update previous ${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE.toLowerCase())} absence`);
      }
      if (existingAbsence.type === ABSENCE_TYPE.NO_LONGER_ACTIVE
        && absenceInfo.type !== existingAbsence.type) {
        absenceInfo = { ...absenceReqInfo, type: ABSENCE_TYPE.PRESENT };
      }
    }
    // Get the absence year to update the absence of the following years accordingly.
    // If FALL chosen then start from the next year
    const filteredAbsence = existingAbsence.faculty.absences
      .find((absence) => absence.id === existingAbsence.id);
    let absenceYear = Number(filteredAbsence.semester.academicYear);
    if (filteredAbsence.semester.term === TERM.FALL) {
      absenceYear += 1;
    }
    // Update the absences, FALL will not be updated here.
    const futureAbsences = existingAbsence.faculty.absences.map((absence) => {
      if (Number(absence.semester.academicYear) >= absenceYear) {
        return { ...absence, type: absenceInfo.type };
      }
      return { ...absence };
    });
    // Save the updated future absences only for no longer active
    if (absenceReqInfo.type === ABSENCE_TYPE.NO_LONGER_ACTIVE
      || existingAbsence.type === ABSENCE_TYPE.NO_LONGER_ACTIVE) {
      await this.facultyRepository.save({
        id: existingAbsence.faculty.id,
        absences: futureAbsences,
      });
    }
    // This will update FALL term.
    // If SPRING term chosen then this will re update the spring
    const validAbsence = {
      ...absenceInfo,
      id: existingAbsence.id,
    };

    return this.absenceRepository.save(validAbsence);
  }
}
