import {
  notStrictEqual,
  strictEqual,
  deepStrictEqual,
} from 'assert';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { FacultyScheduleService } from 'server/faculty/facultySchedule.service';
import { FacultyModule } from 'server/faculty/faculty.module';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { AUTH_MODE } from 'common/constants';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import MockDB from '../../../mocks/database/MockDB';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import {
  allDataValidYears,
  sortResults,
} from '../../../utils/helperFunctions';

describe('Faculty Schedule Service', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let fsService: FacultyScheduleService;
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
          useFactory: async (
            config: ConfigService
          ): Promise<TypeOrmModuleOptions> => ({
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
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))
      .compile();
    fsService = testModule.get(FacultyScheduleService);
    await testModule.createNestApplication().init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('getAllByYear', function () {
    let result: { [key: string]: FacultyResponseDTO[] };
    let acadYears: number[];
    context('when called with an empty array', function () {
      beforeEach(async function () {
        result = await fsService.getAllByYear([]);
      });
      it('should return an empty object', function () {
        strictEqual(Object.keys(result).length, 0);
      });
    });
    context('when called with one argument', function () {
      beforeEach(async function () {
        acadYears = [2020];
        result = await fsService.getAllByYear(acadYears);
      });
      it('should return a non-empty object of data', function () {
        notStrictEqual(Object.keys(result).length, 0);
      });
      it('should return instances from the given academic year only', function () {
        const allKeysValid = Object.keys(result)
          .every((year) => acadYears.includes(parseInt(year, 10)));
        strictEqual(allKeysValid, true);
        strictEqual(allDataValidYears(result), true);
      });
      it('should return the faculty ordered by area, then last name, and then first name', function () {
        const sorted = sortResults(result);
        deepStrictEqual(result, sorted);
      });
    });
    context('when called with multiple arguments', function () {
      beforeEach(async function () {
        acadYears = [2018, 2019, 2020];
        result = await fsService.getAllByYear(acadYears);
      });
      it('should return a non-empty object of data', function () {
        notStrictEqual(Object.keys(result).length, 0);
      });
      it('should return instances from the given academic years only', function () {
        const allKeysValid = Object.keys(result)
          .every((year) => acadYears.includes(parseInt(year, 10)));
        strictEqual(allKeysValid, true);
        strictEqual(allDataValidYears(result), true);
      });
      it('should return the faculty ordered by area, then last name, and then first name', function () {
        const sorted = sortResults(result);
        deepStrictEqual(result, sorted);
      });
    });
  });
});
