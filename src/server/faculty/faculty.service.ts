import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';
import { Absence } from 'server/absence/absence.entity';
import { ABSENCE_TYPE, TERM } from 'common/constants';
import { ConfigService } from 'server/config/config.service';
import { Semester } from 'server/semester/semester.entity';
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

  public async updateFacultyAbsences(
    absenceReqInfo: Pick<Absence, 'id' | 'type'>
  ): Promise<Absence> {
    const existingAbsence = await this.absenceRepository
      .findOne({
        relations: ['faculty'],
        where: { id: absenceReqInfo.id },
      });

    const updateQuery = this.absenceRepository.createQueryBuilder()
      .update(Absence);

    // Are we going to have to do NO_LONGER_ACTIVE gymnastics?
    if (
      [existingAbsence.type, absenceReqInfo.type]
        .includes(ABSENCE_TYPE.NO_LONGER_ACTIVE)
    ) {
      // Looks like it - strap in!
      const ids = (await this.absenceRepository.createQueryBuilder('a')
        .leftJoin(Semester, 's', 'a."semesterId" = s.id')
        .where({ faculty: existingAbsence.faculty.id })
        .andWhere(new Brackets((q) => {
          q.where(
            's."academicYear" >= :acyr',
            { acyr: this.configService.academicYear }
          ).orWhere(
            's."academicYear" = :acyr AND s.term = :term ',
            { acyr: this.configService.academicYear + 1, term: TERM.FALL }
          );
        }))
        .getMany()).map(({ id }) => id);

      updateQuery.where('id IN (:...ids)', { ids });

      // Changing TO NO_LONGER_ACTIVE
      if (
        existingAbsence.type !== ABSENCE_TYPE.NO_LONGER_ACTIVE
        && absenceReqInfo.type === ABSENCE_TYPE.NO_LONGER_ACTIVE
      ) {
        updateQuery.set({ type: ABSENCE_TYPE.NO_LONGER_ACTIVE });
      }

      // Changing FROM NO_LONGER_ACTIVE
      if (
        existingAbsence.type === ABSENCE_TYPE.NO_LONGER_ACTIVE
      && absenceReqInfo.type !== ABSENCE_TYPE.NO_LONGER_ACTIVE
      ) {
        updateQuery.set({ type: ABSENCE_TYPE.PRESENT });
      }
    } else {
      // Nope, just updating a single absence record.
      updateQuery.set({ type: absenceReqInfo.type })
        .where({ id: absenceReqInfo.id });
    }

    await updateQuery.execute();
    return this.absenceRepository.findOne(absenceReqInfo.id);
  }
}
