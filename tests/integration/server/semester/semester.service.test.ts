import { strictEqual } from 'assert';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SemesterModule } from 'server/semester/semester.module';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import {
  ABSENCE_TYPE,
  AUTH_MODE,
  OFFERED,
  TERM,
} from 'common/constants';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { EntityNotFoundError, Repository } from 'typeorm';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { SemesterService } from 'server/semester/semester.service';
import { Semester } from 'server/semester/semester.entity';
import FakeTimers from '@sinonjs/fake-timers';
import { MONTH } from 'common/constants/month';
import { stub } from 'sinon';
import { Faculty } from 'server/faculty/faculty.entity';
import { Absence } from 'server/absence/absence.entity';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { semesters } from '../../../mocks/database/population/data/semesters';

describe('Semester Service', function () {
  let testModule: TestingModule;
  let semesterService: SemesterService;
  let absenceRepository: Repository<Absence>;
  let facultyRepository: Repository<Faculty>;
  let semesterRepository: Repository<Semester>;
  let fakeConfig: ConfigService;

  beforeEach(async function () {
    fakeConfig = new ConfigService(this.database.connectionEnv);
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
        SemesterModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfig)
      .compile();

    semesterService = testModule.get(SemesterService);
    semesterRepository = testModule.get(getRepositoryToken(Semester));
    absenceRepository = testModule.get(getRepositoryToken(Absence));
    facultyRepository = testModule.get(getRepositoryToken(Faculty));
    await testModule.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('addAcademicYear', function () {
    context('when the academic year preceding the requested academic year exists', function () {
      const lastSpringSemester = semesters.slice(-1)[0];
      const testAcademicYear = lastSpringSemester.academicYear + 1;
      let previousSpringNonRetiredInstance: CourseInstance;
      let previousSpringRetiredInstance: CourseInstance;
      let newFallSemester: Semester;
      let newSpringSemester: Semester;
      context('when the previous year\'s offered value is not retired', function () {
        beforeEach(async function () {
          const previousSpringSemester = await semesterRepository
            .findOneOrFail({
              where: {
                term: TERM.SPRING,
                academicYear: lastSpringSemester.academicYear,
              },
              relations: [
                'absences',
                'courseInstances',
                'courseInstances.course',
                'courseInstances.facultyCourseInstances',
                'courseInstances.meetings',
                'nonClassEvents',
                'nonClassEvents.meetings',
              ],
            });

          previousSpringNonRetiredInstance = previousSpringSemester
            .courseInstances
            .find((instance) => instance.offered !== OFFERED.RETIRED);

          await semesterService.addAcademicYear(testAcademicYear);

          newFallSemester = await semesterRepository
            .findOneOrFail({
              where: {
                term: TERM.FALL,
                academicYear: testAcademicYear - 1,
              },
              relations: [
                'absences',
                'courseInstances',
                'courseInstances.course',
                'courseInstances.facultyCourseInstances',
                'courseInstances.meetings',
                'nonClassEvents',
                'nonClassEvents.meetings',
              ],
            });

          newSpringSemester = await semesterRepository
            .findOneOrFail({
              where: {
                term: TERM.SPRING,
                academicYear: testAcademicYear,
              },
              relations: [
                'absences',
                'courseInstances',
                'courseInstances.course',
                'courseInstances.facultyCourseInstances',
                'courseInstances.meetings',
                'nonClassEvents',
                'nonClassEvents.meetings',
              ],
            });
        });
        describe('the course instance', function () {
          it('is created with a blank offered value', function () {
            const actualFallOffered = newFallSemester.courseInstances.find(
              (instance) => instance.course.id
                === previousSpringNonRetiredInstance.course.id
            ).offered;

            const actualSpringOffered = newSpringSemester.courseInstances.find(
              (instance) => instance.course.id
                === previousSpringNonRetiredInstance.course.id
            ).offered;

            strictEqual(actualFallOffered, OFFERED.BLANK, 'Fall offered value is not OFFERED.BLANK.');
            strictEqual(actualSpringOffered, OFFERED.BLANK, 'Spring offered value is not OFFERED.BLANK.');
          });
          it('is created with null values for the enrollment fields', function () {
            const testFallInstance = newFallSemester.courseInstances.find(
              (instance) => instance.course.id
                === previousSpringNonRetiredInstance.course.id
            );

            const testSpringInstance = newSpringSemester.courseInstances.find(
              (instance) => instance.course.id
                === previousSpringNonRetiredInstance.course.id
            );

            strictEqual(testFallInstance.preEnrollment, null, 'Fall pre-enrollment value is not null');
            strictEqual(testFallInstance.studyCardEnrollment, null, 'Fall study card enrollment value is not null');
            strictEqual(testFallInstance.actualEnrollment, null, 'Fall actual enrollment value is not null');
            strictEqual(testSpringInstance.preEnrollment, null, 'Spring pre-enrollment value is not null');
            strictEqual(testSpringInstance.studyCardEnrollment, null, 'Spring study card enrollment value is not null');
            strictEqual(testSpringInstance.actualEnrollment, null, 'Spring actual enrollment value is not null');
          });
          it('is created with no instructors', function () {
            const testFallInstructors = newFallSemester.courseInstances.find(
              (instance) => instance.course.id
                === previousSpringNonRetiredInstance.course.id
            ).facultyCourseInstances;

            const testSpringInstructors = newSpringSemester.courseInstances
              .find(
                (instance) => instance.course.id
                  === previousSpringNonRetiredInstance.course.id
              ).facultyCourseInstances;

            strictEqual(testFallInstructors.length, 0, 'Fall semester was erroneously created with instructors.');
            strictEqual(testSpringInstructors.length, 0, 'Spring semester was erroneously created with instructors.');
          });
          it('is created with no meetings', function () {
            const testFallMeetings = newFallSemester.courseInstances.find(
              (instance) => instance.course.id
                === previousSpringNonRetiredInstance.course.id
            ).meetings;

            const testSpringMeetings = newSpringSemester.courseInstances.find(
              (instance) => instance.course.id
                === previousSpringNonRetiredInstance.course.id
            ).meetings;

            strictEqual(testFallMeetings.length, 0, 'Fall semester was erroneously created with meetings.');
            strictEqual(testSpringMeetings.length, 0, 'Spring semester was erroneously created with meetings.');
          });
        });
        describe('the non class event', function () {
          it('is created with no meetings', function () {
            newFallSemester.nonClassEvents.forEach((nce) => {
              strictEqual(nce.meetings.length, 0, 'Fall non class event was erroneously created with meetings');
            });
            newSpringSemester.nonClassEvents.forEach((nce) => {
              strictEqual(nce.meetings.length, 0, 'Spring non class event was erroneously created with meetings');
            });
          });
        });
        describe('the faculty absence', function () {
          it('is created with the ABSENT_TYPE.PRESENT value', function () {
            newFallSemester.absences.forEach((absence) => {
              strictEqual(absence.type, ABSENCE_TYPE.PRESENT);
            });
            newSpringSemester.absences.forEach((absence) => {
              strictEqual(absence.type, ABSENCE_TYPE.PRESENT);
            });
          });
        });
      });
      context('when the previous year\'s offered value retired', function () {
        beforeEach(async function () {
          const previousSpringSemester = await semesterRepository
            .findOneOrFail({
              where: {
                term: TERM.SPRING,
                academicYear: lastSpringSemester.academicYear,
              },
              relations: [
                'absences',
                'courseInstances',
                'courseInstances.course',
                'courseInstances.facultyCourseInstances',
                'courseInstances.meetings',
                'nonClassEvents',
                'nonClassEvents.meetings',
              ],
            });

          previousSpringRetiredInstance = previousSpringSemester
            .courseInstances
            .find((instance) => instance.offered === OFFERED.RETIRED);

          await semesterService.addAcademicYear(testAcademicYear);

          newFallSemester = await semesterRepository
            .findOneOrFail({
              where: {
                term: TERM.FALL,
                academicYear: testAcademicYear - 1,
              },
              relations: [
                'absences',
                'courseInstances',
                'courseInstances.course',
                'courseInstances.facultyCourseInstances',
                'courseInstances.meetings',
                'nonClassEvents',
                'nonClassEvents.meetings',
              ],
            });

          newSpringSemester = await semesterRepository
            .findOneOrFail({
              where: {
                term: TERM.SPRING,
                academicYear: testAcademicYear,
              },
              relations: [
                'absences',
                'courseInstances',
                'courseInstances.course',
                'courseInstances.facultyCourseInstances',
                'courseInstances.meetings',
                'nonClassEvents',
                'nonClassEvents.meetings',
              ],
            });
        });
        describe('the course instance', function () {
          it('is created with a retired offered value', function () {
            const actualFallOffered = newFallSemester.courseInstances.find(
              (instance) => instance.course.id
              === previousSpringRetiredInstance.course.id
            ).offered;

            const actualSpringOffered = newSpringSemester.courseInstances.find(
              (instance) => instance.course.id
              === previousSpringRetiredInstance.course.id
            ).offered;

            strictEqual(actualFallOffered, OFFERED.RETIRED, 'Fall offered value is not OFFERED.RETIRED.');
            strictEqual(actualSpringOffered, OFFERED.RETIRED, 'Spring offered value is not OFFERED.RETIRED.');
          });
          it('is created with null values for the enrollment fields', function () {
            const testFallInstance = newFallSemester.courseInstances.find(
              (instance) => instance.course.id
              === previousSpringRetiredInstance.course.id
            );

            const testSpringInstance = newSpringSemester.courseInstances.find(
              (instance) => instance.course.id
              === previousSpringRetiredInstance.course.id
            );

            strictEqual(testFallInstance.preEnrollment, null, 'Fall pre-enrollment value is not null');
            strictEqual(testFallInstance.studyCardEnrollment, null, 'Fall study card enrollment value is not null');
            strictEqual(testFallInstance.actualEnrollment, null, 'Fall actual enrollment value is not null');
            strictEqual(testSpringInstance.preEnrollment, null, 'Spring pre-enrollment value is not null');
            strictEqual(testSpringInstance.studyCardEnrollment, null, 'Spring study card enrollment value is not null');
            strictEqual(testSpringInstance.actualEnrollment, null, 'Spring actual enrollment value is not null');
          });
          it('is created with no instructors', function () {
            const testFallInstructors = newFallSemester.courseInstances.find(
              (instance) => instance.course.id
              === previousSpringRetiredInstance.course.id
            ).facultyCourseInstances;

            const testSpringInstructors = newSpringSemester.courseInstances
              .find(
                (instance) => instance.course.id
                === previousSpringRetiredInstance.course.id
              ).facultyCourseInstances;

            strictEqual(testFallInstructors.length, 0, 'Fall semester was erroneously created with instructors.');
            strictEqual(testSpringInstructors.length, 0, 'Spring semester was erroneously created with instructors.');
          });
          it('is created with no meetings', function () {
            const testFallMeetings = newFallSemester.courseInstances.find(
              (instance) => instance.course.id
              === previousSpringRetiredInstance.course.id
            ).meetings;

            const testSpringMeetings = newSpringSemester.courseInstances
              .find(
                (instance) => instance.course.id
                === previousSpringRetiredInstance.course.id
              ).meetings;

            strictEqual(testFallMeetings.length, 0, 'Fall semester was erroneously created with meetings.');
            strictEqual(testSpringMeetings.length, 0, 'Spring semester was erroneously created with meetings.');
          });
        });
        describe('the non class event', function () {
          it('is created with no meetings', function () {
            newFallSemester.nonClassEvents.forEach((nce) => {
              strictEqual(nce.meetings.length, 0, 'Fall non class event was erroneously created with meetings');
            });
            newSpringSemester.nonClassEvents.forEach((nce) => {
              strictEqual(nce.meetings.length, 0, 'Spring non class event was erroneously created with meetings');
            });
          });
        });
        describe('the faculty absence', function () {
          it('is created with the ABSENT_TYPE.PRESENT value', function () {
            newFallSemester.absences.forEach((absence) => {
              strictEqual(absence.type, ABSENCE_TYPE.PRESENT);
            });
            newSpringSemester.absences.forEach((absence) => {
              strictEqual(absence.type, ABSENCE_TYPE.PRESENT);
            });
          });
        });
      });
    });
    context('when the academic year preceding the requested academic year does not yet exist', function () {
      const lastSpringSemester = semesters.slice(-1)[0];
      const testAcademicYear = lastSpringSemester.academicYear + 100;
      it('throws an error', async function () {
        try {
          await semesterService.addAcademicYear(testAcademicYear);
        } catch (err) {
          const error = err as Error;
          strictEqual(err instanceof Error, true);
          strictEqual(error.toString().includes('Cannot create requested academic year until preceding academic year is created.'), true);
        }
      });
    });
    describe('faculty', function () {
      const [lastSpringSemester] = semesters.slice(-1);
      const testAcademicYear = lastSpringSemester.academicYear + 1;
      describe(`is ${ABSENCE_TYPE.NO_LONGER_ACTIVE}`, function () {
        it('carries over from previous available academic year', async function () {
          const absentFaculty = await facultyRepository
            .createQueryBuilder('f')
            .leftJoinAndSelect('f.absences', 'absence')
            .getOne();

          await absenceRepository.createQueryBuilder()
            .update(Absence)
            .set({ type: ABSENCE_TYPE.NO_LONGER_ACTIVE })
            .where('facultyId = :facultyId', { facultyId: absentFaculty.id })
            .execute();

          await semesterService.addAcademicYear(testAcademicYear);

          const newFallSemester = await semesterRepository.findOne({
            where: {
              term: TERM.FALL,
              academicYear: testAcademicYear - 1,
            },
          });
          const newFallAbsence = await absenceRepository.findOne({
            where: {
              faculty: absentFaculty.id,
              semester: newFallSemester.id,
            },
          });
          strictEqual(newFallAbsence.type, ABSENCE_TYPE.NO_LONGER_ACTIVE);

          const newSpringSemester = await semesterRepository.findOne({
            where: {
              term: TERM.SPRING,
              academicYear: testAcademicYear,
            },
          });
          const newSpringAbsence = await absenceRepository.findOne({
            where: {
              faculty: absentFaculty.id,
              semester: newSpringSemester.id,
            },
          });
          strictEqual(newSpringAbsence.type, ABSENCE_TYPE.NO_LONGER_ACTIVE);
        });
      });
      describe(`is anything other than ${ABSENCE_TYPE.NO_LONGER_ACTIVE}`, function () {
        it(`defaults to ${ABSENCE_TYPE.PRESENT}`, async function () {
          const activeFacultyMember = await facultyRepository
            .createQueryBuilder('f')
            .leftJoinAndSelect('f.absences', 'absence')
            .where('absence.type = :type', { type: ABSENCE_TYPE.PARENTAL_LEAVE })
            .getOne();
          await semesterService.addAcademicYear(testAcademicYear);

          const newFallSemester = await semesterRepository.findOne({
            where: {
              term: TERM.FALL,
              academicYear: testAcademicYear - 1,
            },
          });
          const newFallAbsence = await absenceRepository.findOne({
            where: {
              faculty: activeFacultyMember.id,
              semester: newFallSemester.id,
            },
          });
          strictEqual(newFallAbsence.type, ABSENCE_TYPE.PRESENT);

          const newSpringSemester = await semesterRepository.findOne({
            where: {
              term: TERM.SPRING,
              academicYear: testAcademicYear,
            },
          });
          const newSpringAbsence = await absenceRepository.findOne({
            where: {
              faculty: activeFacultyMember.id,
              semester: newSpringSemester.id,
            },
          });
          strictEqual(newSpringAbsence.type, ABSENCE_TYPE.PRESENT);
        });
      });
    });
  });
  describe('Invocation of addAcademicYear', function () {
    let clock: FakeTimers.InstalledClock;
    const lastSpringSemester = semesters.slice(-1)[0];
    const testAcademicYear = lastSpringSemester.academicYear + 1;
    context('before June', function () {
      beforeEach(async function () {
        clock = FakeTimers.install();
        clock.setSystemTime(
          new Date(lastSpringSemester.academicYear - 3, MONTH.FEB, 1, 0, 0, 0)
        );
        // calling init triggers the onApplicationBootstrap hook
        await testModule.createNestApplication().init();
      });
      afterEach(function () {
        clock.uninstall();
      });
      it('should not have created the new academic year', async function () {
        semesterRepository = testModule.get(getRepositoryToken(Semester));
        try {
          await semesterRepository.findOneOrFail({
            where: {
              term: TERM.SPRING,
              academicYear: testAcademicYear,
            },
          });
        } catch (e) {
          strictEqual(e instanceof EntityNotFoundError, true);
        }
      });
    });
    context('in June', function () {
      beforeEach(function () {
        clock = FakeTimers.install();
        clock.setSystemTime(
          new Date(lastSpringSemester.academicYear - 3, MONTH.JUN, 6, 0, 0, 0)
        );
      });
      afterEach(function () {
        clock.uninstall();
      });
      context('In production', function () {
        beforeEach(async function () {
          stub(fakeConfig, 'isProduction').get(() => true);
          // calling init triggers the onApplicationBootstrap hook
          await testModule.createNestApplication().init();
        });
        it('should have created the new academic year', async function () {
          semesterRepository = testModule.get(getRepositoryToken(Semester));
          try {
            await semesterRepository.findOneOrFail({
              where: {
                term: TERM.SPRING,
                academicYear: testAcademicYear,
              },
            });
          } catch (e) {
            strictEqual(e instanceof EntityNotFoundError, false);
          }
        });
      });
      context('NOT in production', function () {
        beforeEach(async function () {
          stub(fakeConfig, 'isProduction').get(() => false);
          // calling init triggers the onApplicationBootstrap hook
          await testModule.createNestApplication().init();
        });
        it('should NOT have created the new academic year', async function () {
          semesterRepository = testModule.get(getRepositoryToken(Semester));
          try {
            await semesterRepository.findOneOrFail({
              where: {
                term: TERM.SPRING,
                academicYear: testAcademicYear,
              },
            });
          } catch (e) {
            strictEqual(e instanceof EntityNotFoundError, true);
          }
        });
      });
    });
  });
});
