import { TestingModule, Test } from '@nestjs/testing';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { Area } from 'server/area/area.entity';
import { Course } from 'server/course/course.entity';
import { CourseService } from 'server/course/course.service';
import { Repository } from 'typeorm';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE } from 'common/constants';
import { deepStrictEqual, strictEqual } from 'assert';
import { CourseModule } from 'server/course/course.module';
import {
  cs50Course,
  physicsCourse,
} from 'testData';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

describe('Course service', function () {
  let courseService: CourseService;
  let courseRepository: Repository<Course>;
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
        CourseModule,
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

    courseService = testModule.get<CourseService>(CourseService);
    courseRepository = testModule.get(getRepositoryToken(Course));
    areaRepository = testModule.get(getRepositoryToken(Area));
    await testModule.createNestApplication().init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  it('returns all courses in the database', async function () {
    const courseCount = await courseRepository.count();
    const returnedCourses = await courseService.findCourses();
    strictEqual(returnedCourses.length, courseCount);
  });
  it('sorts the courses by area in ascending order', async function () {
    await courseRepository.query(`TRUNCATE ${Course.name} CASCADE`);
    const [
      physicsCourseArea,
      computerScienceCourseArea,
    ] = await areaRepository.save([
      {
        name: physicsCourse.area.name,
      },
      {
        name: cs50Course.area.name,
      },
    ]);

    // Save two courses in the database with their areas deliberately
    // not in alphabetical order so that we can check that the
    // courses get sorted by area in ascending alphabetical order
    await courseRepository.save([
      {
        ...cs50Course,
        area: computerScienceCourseArea,
      },
      {
        ...physicsCourse,
        area: physicsCourseArea,
      },
    ]);

    const courses = await courseService.findCourses();
    deepStrictEqual(
      courses.map(({ area }) => area.name),
      [
        physicsCourseArea.name,
        computerScienceCourseArea.name,
      ]
    );
  });
  it('sorts the courses by catalogNumber in ascending order', async function () {
    await courseRepository.query(`TRUNCATE ${Course.name} CASCADE`);
    const [physicsCourseArea] = await areaRepository.save([
      {
        name: physicsCourse.area.name,
      },
    ]);
    // Save two courses in the database with their catalog numbers
    // deliberately not in ascending alphabetical order and
    // assign the physics course area to both as a control
    const [
      compSciCourse,
      physCourse,
    ] = await courseRepository.save([
      {
        ...computerScienceCourse,
        catalogNumber: 'CS 050',
        area: physicsCourseArea,
      },
      {
        ...physicsCourse,
        catalogNumber: 'AP 295a',
        area: physicsCourseArea,
      },
    ]);

    const actualCourses = await courseService.findCourses();
    const actualCatalogNumbers = [
      ...new Set(actualCourses.map(({ catalogNumber }) => catalogNumber)),
    ];

    deepStrictEqual(actualCatalogNumbers, [
      physCourse.catalogNumber,
      compSciCourse.catalogNumber,
    ]);
  });
});
