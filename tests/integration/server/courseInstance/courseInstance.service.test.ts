import {
  strictEqual, notStrictEqual, deepStrictEqual, ok,
} from 'assert';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CourseInstanceModule } from 'server/courseInstance/courseInstance.module';
import { SemesterModule } from 'server/semester/semester.module';
import { CourseInstanceService } from 'server/courseInstance/courseInstance.service';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { Course } from 'server/course/course.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { OFFERED, AUTH_MODE, TERM } from 'common/constants';
import { Meeting } from 'server/meeting/meeting.entity';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import flatMap from 'lodash.flatmap';
import { AuthModule } from 'server/auth/auth.module';
import {
  MultiYearPlanResponseDTO,
  MultiYearPlanInstanceFaculty,
  MultiYearPlanInstance,
} from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { Repository } from 'typeorm';
import { testFourYearPlanAcademicYears } from 'testData';
import CourseInstanceUpdateDTO from 'common/dto/courses/CourseInstanceUpdate.dto';
import { stub } from 'sinon';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

describe('Course Instance Service', function () {
  let testModule: TestingModule;
  let ciService: CourseInstanceService;
  let courseRepository: Repository<Course>;
  let instanceRepository: Repository<CourseInstance>;
  let meetingRepository: Repository<Meeting>;
  let configService: ConfigService;

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
        CourseInstanceModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();

    ciService = testModule.get(CourseInstanceService);
    await testModule.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();

    courseRepository = testModule.get(getRepositoryToken(Course));
    instanceRepository = testModule
      .get(getRepositoryToken(CourseInstance));
    meetingRepository = testModule
      .get(getRepositoryToken(Meeting));
    configService = testModule
      .get<ConfigService>(ConfigService);
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('getAllByYear', function () {
    let result: CourseInstanceResponseDTO[];
    const testYear = 2019;
    beforeEach(async function () {
      result = await ciService.getAllByYear(testYear);
    });
    it('should return instances from spring of that year', function () {
      notStrictEqual(result.length, 0);
      result.forEach(({ spring }) => {
        strictEqual(spring.calendarYear, testYear.toString());
      });
    });
    it('Should return instances from fall of the previous year', function () {
      notStrictEqual(result.length, 0);
      result.forEach(({ fall }) => {
        strictEqual(fall.calendarYear, (testYear - 1).toString());
      });
    });
    it('Should provide a concatenated catalog number', async function () {
      const dbCourses = await courseRepository.find();
      notStrictEqual(result.length, 0);
      result.forEach(({ id, catalogNumber }) => {
        const { prefix, number } = dbCourses.find(
          ({ id: dbID }) => dbID === id
        );
        strictEqual(catalogNumber, `${prefix} ${number}`);
      });
    });
    it('Should list the instructors for each offered instance in the correct order', async function () {
      const dbInstances = await instanceRepository.find({
        relations: ['facultyCourseInstances', 'facultyCourseInstances.faculty'],
      });
      notStrictEqual(result.length, 0);
      result.forEach(({ spring, fall }) => {
        [spring, fall].forEach(({ id, instructors, offered }) => {
          strictEqual(Array.isArray(instructors), true);
          if (offered === OFFERED.Y) {
            const { facultyCourseInstances } = dbInstances.find(
              ({ id: dbID }) => dbID === id
            );
            facultyCourseInstances.forEach(({ order, faculty }) => {
              const resultIndex = instructors.findIndex(
                ({ id: facultyID }) => facultyID === faculty.id
              );
              strictEqual(resultIndex, order);
              strictEqual(
                instructors[resultIndex].displayName,
                `${faculty.lastName}, ${faculty.firstName}`
              );
            });
          }
        });
      });
    });
    it('Should list the faculty notes if any for each instance', async function () {
      const dbInstances = await instanceRepository.find({
        relations: ['facultyCourseInstances', 'facultyCourseInstances.faculty'],
      });
      notStrictEqual(result.length, 0, 'There are no course instances.');
      result.forEach(({ spring, fall }) => {
        [spring, fall].forEach(({ id, instructors, offered }) => {
          if (offered === OFFERED.Y) {
            const { facultyCourseInstances } = dbInstances.find(
              ({ id: dbID }) => dbID === id
            );
            facultyCourseInstances.forEach(({ faculty }) => {
              const resultIndex = instructors.findIndex(
                ({ id: facultyID }) => facultyID === faculty.id
              );
              strictEqual(
                instructors[resultIndex].notes,
                faculty.notes
              );
            });
          }
        });
      });
    });
    describe('Meetings', function () {
      let dbMeetings: Meeting[];
      beforeEach(async function () {
        dbMeetings = await meetingRepository.find({
          relations: ['room', 'room.building'],
        });
      });
      it('Should concatenate the room and building name', function () {
        notStrictEqual(result.length, 0);
        result.forEach(({ spring, fall }) => {
          [spring, fall].forEach(({ meetings }) => {
            meetings.forEach(({ id, room }) => {
              if (id) {
                const { room: dbRoom } = dbMeetings
                  .find(({ id: dbID }) => dbID === id);
                const catName = `${dbRoom.building.name} ${dbRoom.name}`;
                strictEqual(room.name, catName);
              }
            });
          });
        });
      });
    });
    describe('Ordering', function () {
      it('should order by area => prefix => integer => letter', function () {
        for (let i = 0; i < result.length; i++) {
          if (result[i + 1]) {
            const {
              area: areaA,
              catalogNumber: catalogNumberA,
            } = result[i];
            const {
              area: areaB,
              catalogNumber: catalogNumberB,
            } = result[i + 1];
            if (areaA === areaB) {
              const [prefixA, ...numberA] = catalogNumberA.split(' ');
              const [prefixB, ...numberB] = catalogNumberB.split(' ');
              if (prefixA === prefixB) {
                const integerA = parseInt(numberA.join('').replace(/\D*/g, ''), 10);
                const integerB = parseInt(numberB.join('').replace(/\D*/g, ''), 10);
                if (integerA === integerB) {
                  const letterA = numberA.join().replace(/^\d*/g, '');
                  const letterB = numberB.join().replace(/^\d*/g, '');
                  ok(
                    letterA < letterB,
                    `${catalogNumberB} (${areaB}) sorted before ${catalogNumberA} (${areaA})`
                  );
                } else {
                  ok(
                    integerA < integerB,
                    `${catalogNumberB} (${areaB}) sorted before ${catalogNumberA} (${areaA})`
                  );
                }
              } else {
                ok(
                  prefixA < prefixB,
                  `${catalogNumberB} (${areaB}) sorted before ${catalogNumberA} (${areaA})`
                );
              }
            } else {
              ok(
                areaA < areaB,
                `${catalogNumberB} (${areaB}) sorted before ${catalogNumberA} (${areaA})`
              );
            }
          }
        }
      });
    });
    describe('sameAs field', function () {
      context('When sameAs is set on a course', function () {
        it('Should substitute parent instances', async function () {
          const [
            {
              id: childId,
              sameAsId: parentId,
            },
          ] = await courseRepository.query(
            `SELECT id, "sameAsId" FROM course
           WHERE "sameAsId" IS NOT NULL
           LIMIT 1;`
          );
          const childCourse = await courseRepository.findOne(childId);
          notStrictEqual(childCourse, undefined, 'Could not find a child course in database');
          const parentCourse = await courseRepository.findOne(parentId);
          notStrictEqual(parentCourse, undefined, 'Could not find parent course in database');
          const fullCourseList = await ciService.getAllByYear(testYear);
          const parentInList = fullCourseList.find(
            ({ id }) => id === parentCourse.id
          );
          const childInList = fullCourseList.find(
            ({ id }) => id === childCourse.id
          );
          deepStrictEqual(parentInList.spring, childInList.spring, 'Child and parent spring instances do not match');
          deepStrictEqual(parentInList.fall, childInList.fall, 'Child and parent spring instances do not match');
        });
        it('Should list related courses for both parent and child', async function () {
          const [
            {
              id: childId,
              sameAsId: parentId,
            },
          ] = await courseRepository.query(
            `SELECT id, "sameAsId" FROM course
           WHERE "sameAsId" IS NOT NULL
           LIMIT 1;`
          );
          const childCourse = await courseRepository.findOne(childId);
          notStrictEqual(childCourse, undefined, 'Could not find a child course in database');
          const parentCourse = await courseRepository.findOne(parentId);
          notStrictEqual(parentCourse, undefined, 'Could not find parent course in database');
          const fullCourseList = await ciService.getAllByYear(testYear);
          const parentInList = fullCourseList.find(
            ({ id }) => id === parentCourse.id
          );
          const childInList = fullCourseList.find(
            ({ id }) => id === childCourse.id
          );
          strictEqual(parentInList.sameAs.includes(childInList.catalogNumber), true, 'Child not listed in parent sameAs field');
          strictEqual(childInList.sameAs.includes(parentInList.catalogNumber), true, 'Parent not listed in child sameAs field');
        });
      });
      context('When sameAs is not set on a course', function () {
        it('Should display its own instances', async function () {
          const [
            {
              id: singleId,
            },
          ] = await courseRepository.query(
            `SELECT id, "sameAsId" FROM course
           WHERE "sameAsId" IS NULL
           LIMIT 1;`
          );
          const singleCourse = await courseRepository.findOne(singleId, { relations: ['instances', 'instances.semester'] });
          notStrictEqual(singleCourse, undefined, 'Could not find a parent-less course in database');
          const fullCourseList = await ciService.getAllByYear(testYear);
          const courseInList = fullCourseList.find(
            ({ id }) => id === singleCourse.id
          );
          const { id: springId } = singleCourse.instances
            .find(({ semester }) => (
              semester.term === TERM.SPRING
              && semester.academicYear === testYear.toString()
            ));
          const { id: fallId } = singleCourse.instances
            .find(({ semester }) => (
              semester.term === TERM.FALL
              && semester.academicYear === (testYear - 1).toString()
            ));
          deepStrictEqual(courseInList.spring.id, springId, 'spring instance in list does not match entry in database');
          deepStrictEqual(courseInList.fall.id, fallId, 'fall instance in list does not match entry in database');
        });
        it('Should not list any related courses', async function () {
          const [
            {
              id: singleId,
            },
          ] = await courseRepository.query(
            `SELECT id, "sameAsId" FROM course
           WHERE "sameAsId" IS NULL
           LIMIT 1;`
          );
          const singleCourse = await courseRepository.findOne(singleId);
          notStrictEqual(singleCourse, undefined, 'Could not find a parent-less course in database');
          const fullCourseList = await ciService.getAllByYear(testYear);
          const courseInList = fullCourseList.find(
            ({ id }) => id === singleCourse.id
          );
          strictEqual(courseInList.sameAs, '', 'sameAs field in list is not empty');
        });
      });
    });
  });
  describe('getMultiYearPlan', function () {
    let result: MultiYearPlanResponseDTO[];
    beforeEach(async function () {
      result = await ciService.getMultiYearPlan(testFourYearPlanAcademicYears);
    });
    it('should return a nonempty array of data', function () {
      notStrictEqual(result.length, 0);
    });
    it('should return the instructors for each course instance ordered by instructorOrder and displayName', function () {
      const minFacultyToSort = 3;
      const multipleFacultyArrays: MultiYearPlanInstanceFaculty[][] = flatMap(
        result,
        // get all the instances
        (course: MultiYearPlanResponseDTO) => course.semesters
          .map(({ instance }) => instance)
          // discard instances with less than 3 faculty
          .filter((instance: MultiYearPlanInstance) => (
            instance != null && instance.faculty.length >= minFacultyToSort
          ))
          // get the faculty
          .map((instance: MultiYearPlanInstance) => instance.faculty)
      );
      const facultyArraysToCheck = 2;
      // confirm that we have at least 2 to check
      strictEqual(multipleFacultyArrays.length >= facultyArraysToCheck, true);
      // sort the first two with more than 2 faculty
      multipleFacultyArrays
        .slice(0, facultyArraysToCheck)
        .forEach((faculty) => {
          const sorted = faculty.slice().sort((a, b): number => {
            if (a.instructorOrder < b.instructorOrder) {
              return -1;
            }
            if (a.instructorOrder > b.instructorOrder) {
              return 1;
            }
            if (a.displayName < b.displayName) {
              return -1;
            }
            if (a.displayName > b.displayName) {
              return 1;
            }
            return 0;
          });
          deepStrictEqual(faculty, sorted);
        });
    });
    it('should return the courses ordered by catalog prefix and course integer followed by the alphabetical portion of the course', function () {
      const parseCourseNumber = (course: MultiYearPlanResponseDTO) => {
        const courseInfo = {
          numberInteger: null,
          numberAlphabetical: null,
        };
        const numberMatch = /(?<int>\d+)?(?<alpha>[a-zA-Z\s]+)?/.exec(course.catalogNumber);
        if (numberMatch && 'groups' in numberMatch) {
          const { alpha, int } = numberMatch.groups;
          courseInfo.numberInteger = int
            ? parseInt(int, 10)
            : null;
          courseInfo.numberAlphabetical = alpha || null;
        }
        return courseInfo;
      };
      const sorted = result.slice().sort((course1, course2): number => {
        const course1Info = parseCourseNumber(course1);
        const course2Info = parseCourseNumber(course2);
        if (course1.catalogPrefix < course2.catalogPrefix) {
          return -1;
        }
        if (course1.catalogPrefix > course2.catalogPrefix) {
          return 1;
        }
        if (course1Info.numberInteger < course2Info.numberInteger) {
          return -1;
        }
        if (course1Info.numberInteger > course2Info.numberInteger) {
          return 1;
        }
        if (course1Info.numberAlphabetical < course2Info.numberAlphabetical) {
          return -1;
        }
        if (course1Info.numberAlphabetical > course2Info.numberAlphabetical) {
          return 1;
        }
        return 0;
      });
      deepStrictEqual(result, sorted);
    });
    it('should return the semesters in chronological order', function () {
      const sorted = result.map((course) => ({
        ...course,
        semesters: course
          .semesters.slice().sort((semester1, semester2): number => {
            if (semester1.academicYear < semester2.academicYear) {
              return -1;
            }
            if (semester1.academicYear > semester2.academicYear) {
              return 1;
            }
            if (semester1.calendarYear < semester2.calendarYear) {
              return -1;
            }
            if (semester1.calendarYear > semester2.calendarYear) {
              return 1;
            }
            return 0;
          }),
      }));
      strictEqual(
        JSON.stringify(result),
        JSON.stringify(sorted)
      );
    });
  });
  describe('editCourseInstance', function () {
    let instance: CourseInstance;
    let updateInfo: CourseInstanceUpdateDTO;
    let newOfferedValue: OFFERED;
    let result: CourseInstanceUpdateDTO;
    let response;
    const currentAcademicYear = '2020';
    beforeEach(function () {
      stub(configService, 'academicYear').get(() => currentAcademicYear);
    });
    describe('editing an offered value to a non-retired value', function () {
      context('when we are editing a past academic year instance', function () {
        beforeEach(async function () {
          newOfferedValue = OFFERED.N;
          instance = await instanceRepository.findOneOrFail({
            where: {
              semester: {
                academicYear: parseInt(currentAcademicYear, 10) - 2,
              },
            },
            relations: ['course', 'semester'],
          });
          updateInfo = {
            preEnrollment: instance.preEnrollment,
            studyCardEnrollment: instance.studyCardEnrollment,
            actualEnrollment: instance.actualEnrollment,
            offered: newOfferedValue,
          };
          result = await ciService.editCourseInstance(instance.id, updateInfo);
        });
        it('should return the updated instance', function () {
          deepStrictEqual(result, updateInfo);
        });
      });
      context('when we are editing a current academic year instance', function () {
        beforeEach(async function () {
          newOfferedValue = OFFERED.Y;
          instance = await instanceRepository.findOneOrFail({
            where: {
              semester: {
                academicYear: currentAcademicYear,
              },
            },
            relations: ['course', 'semester'],
          });
          updateInfo = {
            preEnrollment: instance.preEnrollment,
            studyCardEnrollment: instance.studyCardEnrollment,
            actualEnrollment: instance.actualEnrollment,
            offered: newOfferedValue,
          };
          result = await ciService.editCourseInstance(instance.id, updateInfo);
        });
        it('should return the updated instance', function () {
          deepStrictEqual(result, updateInfo);
        });
      });
      context('when we are editing a future academic year instance', function () {
        beforeEach(async function () {
          newOfferedValue = OFFERED.N;
          instance = await instanceRepository.findOneOrFail({
            where: {
              semester: {
                academicYear: parseInt(currentAcademicYear, 10) + 1,
              },
            },
            relations: ['course', 'semester'],
          });
          updateInfo = {
            preEnrollment: instance.preEnrollment,
            studyCardEnrollment: instance.studyCardEnrollment,
            actualEnrollment: instance.actualEnrollment,
            offered: newOfferedValue,
          };
          result = await ciService.editCourseInstance(instance.id, updateInfo);
        });
        it('should return the updated instance', function () {
          deepStrictEqual(result, updateInfo);
        });
      });
    });
    describe('editing an offered value to OFFERED.RETIRED', function () {
      context('when we are editing a past academic year instance', function () {
        beforeEach(async function () {
          newOfferedValue = OFFERED.RETIRED;
          instance = await instanceRepository.findOneOrFail({
            where: {
              semester: {
                academicYear: parseInt(currentAcademicYear, 10) - 2,
              },
            },
            relations: ['course', 'semester'],
          });
          updateInfo = {
            preEnrollment: instance.preEnrollment,
            studyCardEnrollment: instance.studyCardEnrollment,
            actualEnrollment: instance.actualEnrollment,
            offered: newOfferedValue,
          };
          try {
            result = await ciService
              .editCourseInstance(instance.id, updateInfo);
          } catch (error) {
            response = error;
          }
        });
        it('should throw a Bad Request Exception', function () {
          strictEqual(response.status, 400);
        });
      });
      context('when we are editing a current academic year instance', function () {
        beforeEach(async function () {
          newOfferedValue = OFFERED.RETIRED;
          instance = await instanceRepository.findOneOrFail({
            where: {
              semester: {
                academicYear: currentAcademicYear,
              },
            },
            relations: ['course', 'semester'],
          });
          updateInfo = {
            preEnrollment: instance.preEnrollment,
            studyCardEnrollment: instance.studyCardEnrollment,
            actualEnrollment: instance.actualEnrollment,
            offered: newOfferedValue,
          };
          result = await ciService.editCourseInstance(instance.id, updateInfo);
        });
        it('should return the updated instance', function () {
          deepStrictEqual(result, updateInfo);
        });
      });
      context('when we are editing a future academic year instance', function () {
        beforeEach(async function () {
          newOfferedValue = OFFERED.RETIRED;
          instance = await instanceRepository.findOneOrFail({
            where: {
              semester: {
                academicYear: parseInt(currentAcademicYear, 10) + 1,
              },
            },
            relations: ['course', 'semester'],
          });
          updateInfo = {
            preEnrollment: instance.preEnrollment,
            studyCardEnrollment: instance.studyCardEnrollment,
            actualEnrollment: instance.actualEnrollment,
            offered: newOfferedValue,
          };
          result = await ciService.editCourseInstance(instance.id, updateInfo);
        });
        it('should return the updated instance', function () {
          deepStrictEqual(result, updateInfo);
        });
      });
    });
  });
});
