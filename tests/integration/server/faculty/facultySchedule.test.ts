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
  getRepositoryToken,
} from '@nestjs/typeorm';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { FacultyModule } from 'server/faculty/faculty.module';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { AUTH_MODE } from 'common/constants';
import {
  stub,
  SinonStub,
} from 'sinon';
import request from 'supertest';
import {
  HttpStatus,
  HttpServer,
  ForbiddenException,
} from '@nestjs/common';

import { Faculty } from 'server/faculty/faculty.entity';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import {
  regularUser,
  string,
} from 'common/__tests__/data';
import { SessionModule } from 'nestjs-session';
import { Repository } from 'typeorm';
import {
  allDataValidYears,
  sortResults,
} from '../../../utils/helperFunctions';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import MockDB from '../../../mocks/database/MockDB';
import { PopulationModule } from '../../../mocks/database/population/population.module';

describe('Faculty Schedule API', function () {
  let authStub: SinonStub;
  let api: HttpServer;
  let testModule: TestingModule;
  let db: MockDB;
  before(async function () {
    db = new MockDB();
    await db.init();
  });
  after(async function () {
    await db.stop();
  });

  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');

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
        SessionModule.forRoot({
          session: {
            secret: string,
            resave: true,
            saveUninitialized: true,
          },
        }),
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))
      .compile();

    const nestApp = await testModule.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();

    api = nestApp.getHttpServer();
  });
  afterEach(async function () {
    authStub.restore();
    await testModule.close();
  });
  describe('GET /', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/faculty/schedule');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    describe('User is authenticated', function () {
      let result: { [key: string]: FacultyResponseDTO[] };
      it('is accessible to authenticated users', async function () {
        authStub.resolves(regularUser);

        const response = await request(api).get('/api/faculty/schedule');

        strictEqual(response.ok, true);
      });
      it('returns all faculty in the database', async function () {
        const response = await request(api).get('/api/faculty/schedule');
        result = response.body;
        const facultyRepository: Repository<Faculty> = testModule
          .get(getRepositoryToken(Faculty));
        const dbFaculty = await facultyRepository.find();
        // every faculty member
        const allFacultyFound = dbFaculty.every((faculty) => (
          // appears in at least one year
          Object.values(result).some((dtos) => (
            // and within that year at least one object
            dtos.some((dto) => dto.firstName === faculty.firstName
              && dto.lastName === faculty.lastName)
          ))
        ));
        strictEqual(dbFaculty.length > 0, true);
        strictEqual(allFacultyFound, true);
      });
      context('when one year is provided', function () {
        let acadYears: number[];
        beforeEach(async function () {
          acadYears = [2020];
          const response = await request(api).get('/api/faculty/schedule?acadYears=' + acadYears.join(','));
          result = response.body;
        });
        it('should return a non-empty object of data for the requested academic year', function () {
          notStrictEqual(Object.keys(result).length, 0);
          deepStrictEqual(Object.keys(result), acadYears.map(String));
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
      context('when more than one year is provided', function () {
        let acadYears: number[];
        beforeEach(async function () {
          acadYears = [2018, 2019, 2020];
          const response = await request(api).get('/api/faculty/schedule?acadYears=' + acadYears.join(','));
          result = response.body;
        });
        it('should return a non-empty object of data for the requested academic years', function () {
          notStrictEqual(Object.keys(result).length, 0);
          deepStrictEqual(Object.keys(result).sort(), acadYears.map(String));
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
});
