import path from 'path';
import { strictEqual } from 'assert';
import { stub, SinonStub } from 'sinon';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { CourseInstanceModule } from 'server/courseInstance/courseInstance.module';
import { SemesterModule } from 'server/semester/semester.module';
import { CourseInstanceService } from 'server/courseInstance/courseInstance.service';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { TERM } from 'server/semester/semester.entity';
import { Course } from 'server/course/course.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { OFFERED } from 'common/constants';
import MockDB from '../../../mocks/database/MockDB';
import { PopulationModule } from '../../../mocks/database/population/population.module';

const entityPathGlob = path.resolve(__dirname, '../../../../src/server/**/*.entity.ts');

describe.only('Course Instance Service', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let ciService: CourseInstanceService;
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
        TypeOrmModule.forRoot({
          ...db.connectionOptions,
          synchronize: true,
          autoLoadEntities: true,
          retryAttempts: 10,
          retryDelay: 10000,
          entities: [
            entityPathGlob,
          ],
        }),
        PopulationModule,
        SemesterModule,
        CourseInstanceModule,
      ],
    }).compile();
    ciService = testModule.get(CourseInstanceService);
    await testModule.createNestApplication().init();
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
    it('should return instances from spring of that year', async function () {
      result.forEach(({ spring }) => {
        strictEqual(spring.calendarYear, testYear.toString());
      });
    });
    it('Should return instances from fall of the previous year', async function () {
      result.forEach(({ fall }) => {
        strictEqual(fall.calendarYear, (testYear - 1).toString());
      });
    });
    it('Should provide a concatenated catalog number', async function () {
      const courseRepository = testModule.get(getRepositoryToken(Course));
      const dbCourses = await courseRepository.find();
      result.forEach(({ id, catalogNumber }) => {
        const { prefix, number } = dbCourses.find(
          ({ id: dbID }) => dbID === id
        );
        strictEqual(catalogNumber, `${prefix} ${number}`);
      });
    });
    it('Should list the instructors for each offered instance in the correct order', async function () {
      const instanceRepository = testModule
        .get(getRepositoryToken(CourseInstance));
      const dbInstances = await instanceRepository.find({
        relations: ['facultyCourseInstances', 'facultyCourseInstances.faculty'],
      });
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
    it('Should format the startTimes as HH:MM AM');
    it('Should format the endTimes as HH:MM AM');
    it('Should concatenate the room and building name');
  });
});
