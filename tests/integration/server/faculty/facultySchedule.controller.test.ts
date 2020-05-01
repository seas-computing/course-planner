import {
  Test,
  TestingModule,
} from '@nestjs/testing';
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
import {
  strictEqual,
  deepStrictEqual,
} from 'assert';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Area } from 'server/area/area.entity';
import { FacultyModule } from 'server/faculty/faculty.module';
import { Faculty } from 'server/faculty/faculty.entity';
import { AuthModule } from 'server/auth/auth.module';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import {
  regularUser,
  string,
} from 'common/__tests__/data';
import { SessionModule } from 'nestjs-session';
import { FacultyScheduleAbsenceView } from 'server/faculty/FacultyScheduleAbsenceView.entity';
import { FacultyScheduleCourseView } from 'server/faculty/FacultyScheduleCourseView.entity';
import { FacultyScheduleSemesterView } from 'server/faculty/FacultyScheduleSemesterView.entity';
import { FacultyScheduleView } from 'server/faculty/FacultyScheduleView.entity';
import { AUTH_MODE } from 'common/constants';
import { FacultyScheduleService } from 'server/faculty/facultySchedule.service';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

const mockFacultyRepository = {
  getAllFaculty: stub(),
};

const mockFacultyScheduleService = {
  getAllByYear: stub(),
};

const mockAreaRepository = {};

const mockFacultyScheduleAbsenceViewRepository = {};

const mockFacultyScheduleCourseViewRepository = {};

const mockFacultyScheduleSemesterViewRepository = {};

const mockFacultyScheduleViewRepository = {};

describe('Faculty Schedule API', function () {
  let authStub: SinonStub;
  let api: HttpServer;

  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: {
            secret: string,
            resave: true,
            saveUninitialized: true,
          },
        }),
        ConfigModule,
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
        FacultyModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ NODE_ENV: 'production' }))

      .overrideProvider(getRepositoryToken(Faculty))
      .useValue(mockFacultyRepository)

      .overrideProvider(FacultyScheduleService)
      .useValue(mockFacultyScheduleService)

      .overrideProvider(getRepositoryToken(Area))
      .useValue(mockAreaRepository)

      .overrideProvider(getRepositoryToken(FacultyScheduleAbsenceView))
      .useValue(mockFacultyScheduleAbsenceViewRepository)

      .overrideProvider(getRepositoryToken(FacultyScheduleCourseView))
      .useValue(mockFacultyScheduleCourseViewRepository)

      .overrideProvider(getRepositoryToken(FacultyScheduleSemesterView))
      .useValue(mockFacultyScheduleSemesterViewRepository)

      .overrideProvider(getRepositoryToken(FacultyScheduleView))
      .useValue(mockFacultyScheduleViewRepository)

      .compile();

    const nestApp = await module.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();

    api = nestApp.getHttpServer();
  });
  afterEach(function () {
    authStub.restore();
    Object.values({
      ...mockFacultyRepository,
      ...mockAreaRepository,
      ...mockFacultyScheduleService,
      ...mockFacultyScheduleAbsenceViewRepository,
      ...mockFacultyScheduleCourseViewRepository,
      ...mockFacultyScheduleSemesterViewRepository,
      ...mockFacultyScheduleViewRepository,
    })
      .forEach((sinonStub: SinonStub): void => {
        sinonStub.reset();
      });
  });
  describe('GET /', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/faculty/schedule');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyScheduleService.getAllByYear.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      it('is accessible to authenticated users and returns all faculty in the database', async function () {
        authStub.resolves(regularUser);
        const mockFaculty = {
          2020: Array(10).fill({
            ...new Faculty(),
            area: new Area(),
          }),
        };
        mockFacultyScheduleService.getAllByYear.resolves(mockFaculty);

        const response = await request(api).get('/api/faculty/schedule');

        strictEqual(response.ok, true);
        deepStrictEqual(
          response.body,
          JSON.parse(JSON.stringify(mockFaculty))
        );
        strictEqual(mockFacultyScheduleService.getAllByYear.callCount, 1);
      });
    });
  });
});
