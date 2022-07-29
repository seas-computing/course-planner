import { FacultyService } from 'server/faculty/faculty.service';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { FacultyModule } from 'server/faculty/faculty.module';
import { deepStrictEqual, notStrictEqual, strictEqual } from 'assert';
import { Repository } from 'typeorm';
import { Faculty } from 'server/faculty/faculty.entity';
import {
  appliedMathFacultyMemberRequest,
  bioengineeringFacultyMember,
} from 'testData';
import { Area } from 'server/area/area.entity';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE, ABSENCE_TYPE, TERM } from 'common/constants';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { InstructorResponseDTO } from '../../../../src/common/dto/courses/InstructorResponse.dto';

describe('Faculty service', function () {
  let facultyService: FacultyService;
  let facultyRepository: Repository<Faculty>;
  let areaRepository: Repository<Area>;
  let testModule: TestingModule;

  beforeEach(async function () {
    testModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (
            config: ConfigService
          ): TypeOrmModuleOptions => ({
            ...config.dbOptions,
            synchronize: true,
            autoLoadEntities: true,
            retryAttempts: 10,
            retryDelay: 10000,
          }),
          inject: [ConfigService],
        }),
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
        PopulationModule,
        FacultyModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(Area),
          useValue: new Repository<Area>(),
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();

    facultyService = testModule.get<FacultyService>(FacultyService);
    facultyRepository = testModule.get(getRepositoryToken(Faculty));
    areaRepository = testModule.get(getRepositoryToken(Area));
    await testModule.createNestApplication().init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('updateFacultyAbsences', function () {
    let faculty1: Faculty;
    let firstYr: number;
    let firstSmstrAbsence: AbsenceResponseDTO;
    let midYear: number;
    let midYearFallAbsence: AbsenceResponseDTO;
    let midYearSpringAbsence: AbsenceResponseDTO;
    beforeEach(async function () {
      const facultyarray = await facultyRepository
        .find({ relations: ['absences', 'absences.semester'] });
      faculty1 = facultyarray[0];
      const allyears = (faculty1.absences
        .map((year) => Number(year.semester.academicYear))).sort();
      firstYr = allyears[0];
      const firstYearAbsence = faculty1.absences
        .filter((absence) => absence.semester.academicYear === String(firstYr));
      try {
        const firstYearSpring = firstYearAbsence
          .find((absence) => absence.semester.term === TERM.SPRING);
        firstSmstrAbsence = (({ id, type }) => ({ id, type }))(firstYearSpring);
      } catch {
        const firstYearFall = firstYearAbsence
          .find((absence) => absence.semester.term === TERM.FALL);
        firstSmstrAbsence = (({ id, type }) => ({ id, type }))(firstYearFall);
      }
      midYear = allyears[Math.floor(allyears.length / 2)];
      const midYearAbsence = faculty1.absences
        .filter((absence) => absence.semester.academicYear === String(midYear));
      try {
        const spring = midYearAbsence
          .find((absence) => absence.semester.term === TERM.SPRING);
        midYearSpringAbsence = (({ id, type }) => ({ id, type }))(spring);
      } catch {
        midYearSpringAbsence = null;
      }
      try {
        const fall = midYearAbsence
          .find((absence) => absence.semester.term === TERM.FALL);
        midYearFallAbsence = (({ id, type }) => ({ id, type }))(fall);
      } catch {
        midYearFallAbsence = null;
      }
      // update the faculty absense to be present for all the semesters
      await facultyService.updateFacultyAbsences(
        { ...firstSmstrAbsence, type: ABSENCE_TYPE.NO_LONGER_ACTIVE },
        String(firstYr)
      );
      await facultyService.updateFacultyAbsences(
        { ...firstSmstrAbsence, type: ABSENCE_TYPE.PRESENT }, String(firstYr)
      );
    });
    it('all the absence of the selected faculty should be PRESENT', async function () {
      const faculty2 = await facultyRepository.findOne({
        relations: ['absences', 'absences.semester'],
        where: {
          id: faculty1.id,
        },
      });
      const check = faculty2.absences
        .filter((absence) => absence.type !== ABSENCE_TYPE.PRESENT);
      strictEqual(check.length, 0);
    });
    it('update SPRING absences to NO_LONGER_ACTIVE', async function () {
      await facultyService.updateFacultyAbsences(
        { ...midYearSpringAbsence, type: ABSENCE_TYPE.NO_LONGER_ACTIVE },
        String(midYear)
      );
      const faculty2 = await facultyRepository.findOne({
        relations: ['absences', 'absences.semester'],
        where: {
          id: faculty1.id,
        },
      });
      const nla = faculty2.absences
        .filter((absence) => absence.type === ABSENCE_TYPE.NO_LONGER_ACTIVE);
      const present = faculty2.absences
        .filter((absence) => absence.type === ABSENCE_TYPE.PRESENT);
      const chech_nla = nla
        .filter((absence) => Number(absence.semester.academicYear) < midYear);
      const chech_present = present
        .filter((absence) => Number(absence.semester.academicYear) >= midYear);
      const totalAbsences = present.length + nla.length;
      notStrictEqual(present.length, 0);
      notStrictEqual(nla.length, 0);
      strictEqual(chech_present.length, 0);
      strictEqual(chech_nla.length, 0);
      strictEqual(faculty1.absences.length, totalAbsences);
    });
    it('update FALL absences to NO_LONGER_ACTIVE', async function () {
      await facultyService.updateFacultyAbsences(
        { ...midYearFallAbsence, type: ABSENCE_TYPE.NO_LONGER_ACTIVE },
        String(midYear)
      );
      const faculty2 = await facultyRepository.findOne({
        relations: ['absences', 'absences.semester'],
        where: {
          id: faculty1.id,
        },
      });
      const nla = faculty2.absences
        .filter((absence) => absence.type === ABSENCE_TYPE.NO_LONGER_ACTIVE);
      const present = faculty2.absences
        .filter((absence) => absence.type === ABSENCE_TYPE.PRESENT);
      const chech_nla = nla
        .filter((absence) => Number(absence.semester.academicYear) < midYear);
      const chech_present = present
        .filter((absence) => Number(absence.semester.academicYear) >= midYear);
      const totalAbsences = present.length + nla.length;
      notStrictEqual(present.length, 0);
      notStrictEqual(nla.length, 0);
      strictEqual(chech_present.length, 1);
      strictEqual(chech_nla.length, 0);
      strictEqual(chech_present[0].semester.term, 'SPRING');
      strictEqual(Number(chech_present[0].semester.academicYear), midYear);
      strictEqual(faculty1.absences.length, totalAbsences);
    });
    it('update previous SPRING  absences to NO_LONGER_ACTIVE', async function () {
      let result:string;
      try {
        await facultyService.updateFacultyAbsences(
          { ...midYearSpringAbsence, type: ABSENCE_TYPE.NO_LONGER_ACTIVE },
          String(midYear + 1)
        );
      } catch (e) {
        result = e.message;
      }
      strictEqual(result, 'Can not update previous NO_LONGER_ACTIVE absence');
    });
  });
});
