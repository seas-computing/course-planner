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
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { semesters } from '../../../mocks/database/population/data/semesters';

describe('Semester Service', function () {
  let testModule: TestingModule;
  let semesterService: SemesterService;
  let semesterRepository: Repository<Semester>;

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
        SemesterModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();

    semesterService = testModule.get(SemesterService);
    semesterRepository = testModule.get(getRepositoryToken(Semester));
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
      beforeEach(async function () {
        clock = FakeTimers.install();
        clock.setSystemTime(
          new Date(lastSpringSemester.academicYear - 3, MONTH.JUN, 6, 0, 0, 0)
        );
        // calling init triggers the onApplicationBootstrap hook
        await testModule.createNestApplication().init();
      });
      afterEach(function () {
        clock.uninstall();
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
  });
});
