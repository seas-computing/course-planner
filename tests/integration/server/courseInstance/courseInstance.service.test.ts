import { strictEqual, notStrictEqual, deepStrictEqual } from 'assert';
import { parse } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CourseInstanceModule } from 'server/courseInstance/courseInstance.module';
import { SemesterModule } from 'server/semester/semester.module';
import { CourseInstanceService } from 'server/courseInstance/courseInstance.service';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { Course } from 'server/course/course.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { OFFERED } from 'common/constants';
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
import { testFourYearPlanAcademicYears } from 'common/data';
import MockDB from '../../../mocks/database/MockDB';
import { PopulationModule } from '../../../mocks/database/population/population.module';

describe('Course Instance Service', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let ciService: CourseInstanceService;
  let courseRepository: Repository<Course>;
  let instanceRepository: Repository<CourseInstance>;
  let meetingRepository: Repository<Meeting>;
  before(async function () {
    db = new MockDB();
    await db.init();
  });
  after(async function () {
    await db.stop();
  });
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
        AuthModule,
        PopulationModule,
        SemesterModule,
        CourseInstanceModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))
      .compile();
    ciService = testModule.get(CourseInstanceService);
    await testModule.createNestApplication().init();
    courseRepository = testModule.get(getRepositoryToken(Course));
    instanceRepository = testModule
      .get(getRepositoryToken(CourseInstance));
    meetingRepository = testModule
      .get(getRepositoryToken(Meeting));
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
    describe('Meetings', function () {
      let dbMeetings: Meeting[];
      beforeEach(async function () {
        dbMeetings = await meetingRepository.find({
          relations: ['room', 'room.building'],
        });
      });
      it('Should format the startTimes and endTimes as HH:MM AM', function () {
        notStrictEqual(result.length, 0);
        result.forEach(({ spring, fall }) => {
          [spring, fall].forEach(({ meetings }) => {
            meetings.forEach(({ id, startTime, endTime }) => {
              if (id) {
                const {
                  startTime: dbStartTime,
                  endTime: dbEndTime,
                } = dbMeetings
                  .find(
                    ({ id: dbID }) => dbID === id
                  );
                // We're using Jan 1 as the date because JS is being too clever
                // and always trying to componsate for DST for us.
                const fmtDBStartTime = format(
                  utcToZonedTime(
                    parse(
                      dbStartTime,
                      'HH:mm:ssx',
                      new Date(2020, 0, 1)
                    ),
                    'America/New_York'
                  ),
                  'hh:mm aa'
                );
                const fmtDBEndTime = format(
                  utcToZonedTime(
                    parse(
                      dbEndTime,
                      'HH:mm:ssx',
                      new Date(2020, 0, 1)
                    ),
                    'America/New_York'
                  ),
                  'hh:mm aa'
                );

                strictEqual(startTime, fmtDBStartTime);
                strictEqual(endTime, fmtDBEndTime);
              }
            });
          });
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
    it('should return the courses ordered by area and catalog number', function () {
      const sorted = result.slice().sort((course1, course2): number => {
        if (course1.area < course2.area) {
          return -1;
        }
        if (course1.area > course2.area) {
          return 1;
        }
        if (course1.catalogNumber < course2.catalogNumber) {
          return -1;
        }
        if (course1.catalogNumber > course2.catalogNumber) {
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
});
