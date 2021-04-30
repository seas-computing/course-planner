import { Test, TestingModule } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import {
  stub,
  SinonStub,
} from 'sinon';
import request, { Response } from 'supertest';
import {
  HttpStatus,
  HttpServer,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from 'server/config/config.service';
import { adminUser, regularUser } from 'testData';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { strictEqual, deepStrictEqual, notStrictEqual } from 'assert';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  AUTH_MODE, DAY, TERM, TERM_PATTERN,
} from 'common/constants';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import RoomResponse from 'common/dto/room/RoomResponse.dto';
import * as dummy from 'testData';
import { LocationModule } from 'server/location/location.module';
import RoomRequest from 'common/dto/room/RoomRequest.dto';
import flatMap from 'lodash.flatmap';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import MockDB from '../../../mocks/database/MockDB';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { rooms } from '../../../mocks/database/population/data/rooms';
import { courses } from '../../../mocks/database/population/data/courses';

describe('Location API', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let authStub: SinonStub;
  let api: HttpServer;

  before(async function () {
    this.timeout(120000);
    db = new MockDB();
    return db.init();
  });

  after(async function () {
    await db.stop();
  });

  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');
    testModule = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: {
            secret: dummy.safeString,
            resave: true,
            saveUninitialized: true,
          },
        }),
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
        LocationModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))

      .compile();

    const nestApp = await testModule
      .createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();

    api = nestApp.getHttpServer() as HttpServer;
  });

  afterEach(async function () {
    await testModule.close();
  });

  describe('GET /rooms', function () {
    const testParams: RoomRequest = {
      calendarYear: '2020',
      term: TERM.FALL,
      day: DAY.MON,
      startTime: '10:00:00-05',
      endTime: '20:00:00-05',
    };
    context('As an unauthenticated user', function () {
      beforeEach(function () {
        authStub.resolves(null);
      });
      let response: Response;
      it('should return a 400 status', async function () {
        authStub.rejects(new ForbiddenException());

        response = await request(api)
          .get('/api/rooms')
          .query(testParams);

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    context('As an authenticated user', function () {
      let response: Response;
      context('As an admin user', function () {
        context('With an invalid year', function () {
          let result: RoomResponse[];
          beforeEach(async function () {
            authStub.resolves(adminUser);
            const invalidYear = '1902';
            response = await request(api)
              .get('/api/rooms')
              .query({ ...testParams, calendarYear: invalidYear });
            result = response.body;
          });
          it('should return a 200 status', function () {
            strictEqual(response.status, HttpStatus.OK);
          });
          it('should return all rooms', function () {
            strictEqual(result.length, rooms.length);
          });
          it('should return no meeting titles', function () {
            strictEqual(result.every((room) => room.meetingTitles.length === 0),
              true);
          });
        });
        context('With an invalid term', function () {
          beforeEach(async function () {
            authStub.resolves(adminUser);
            const invalidTerm = 'fakeTerm' as TERM;
            response = await request(api)
              .get('/api/rooms')
              .query({ ...testParams, term: invalidTerm });
          });
          it('should return a 400 status', function () {
            strictEqual(response.status, HttpStatus.BAD_REQUEST);
          });
        });
        context('With an invalid day', function () {
          beforeEach(async function () {
            authStub.resolves(adminUser);
            const invalidDay = 'fakeDay' as DAY;
            response = await request(api)
              .get('/api/rooms')
              .query({ ...testParams, day: invalidDay });
          });
          it('should return a 400 status', function () {
            strictEqual(response.status, HttpStatus.BAD_REQUEST);
          });
        });
        context('With an invalid start time', function () {
          beforeEach(async function () {
            authStub.resolves(adminUser);
            const invalidStartTime = '10:00AM';
            response = await request(api)
              .get('/api/rooms')
              .query({ ...testParams, startTime: invalidStartTime });
          });
          it('should return a 400 status', function () {
            strictEqual(response.status, HttpStatus.BAD_REQUEST);
          });
        });
        context('With an invalid end time', function () {
          beforeEach(async function () {
            authStub.resolves(adminUser);
            const invalidEndTime = '26:00:00-05';
            response = await request(api)
              .get('/api/rooms')
              .query({ ...testParams, endTime: invalidEndTime });
          });
          it('should return a 400 status', function () {
            strictEqual(response.status, HttpStatus.BAD_REQUEST);
          });
        });
        context('With valid parameters', function () {
          let result: RoomResponse[];
          beforeEach(async function () {
            authStub.resolves(adminUser);
            response = await request(api)
              .get('/api/rooms')
              .query(testParams);
            result = response.body;
          });
          it('should return a 200 status', function () {
            strictEqual(response.status, HttpStatus.OK);
          });
          it('should return a nonempty array of data', function () {
            strictEqual(Array.isArray(result), true);
            notStrictEqual(result.length, 0);
          });
          it('returns all rooms in the database', function () {
            const actualRooms = result.map((room) => room.name);
            const expectedRooms = rooms.map((room) => `${room.building} ${room.name}`);
            deepStrictEqual(actualRooms, expectedRooms);
          });
          it('returns the expected meetings', function () {
            const actualMeetings = result
              .map((room) => room.meetingTitles)
              .reduce((acc, val) => acc.concat(val), [])
              .sort();
            // Returns an array of sorted course meeting titles that occur during the requested times
            const expectedMeetings = flatMap(courses.map(
              (course) => course.instances.meetings
                .filter((meeting) => meeting.day === testParams.day
                && (course.termPattern === TERM_PATTERN.BOTH
                  || course.termPattern === testParams
                    .term as unknown as TERM_PATTERN)
                && ((meeting.startTime <= testParams.startTime
                  && meeting.endTime >= testParams.endTime)
                  || (meeting.startTime >= testParams.startTime
                    && meeting.startTime < testParams.endTime)
                    || (meeting.endTime > testParams.startTime
                      && meeting.endTime <= testParams.endTime)))
                .map(() => `${course.prefix} ${course.number}`)
            )).sort();
            deepStrictEqual(actualMeetings, expectedMeetings);
          });
        });
      });
      context('As a non-admin user', function () {
        beforeEach(async function () {
          authStub.resolves(regularUser);
          response = await request(api)
            .get('/api/rooms')
            .query(testParams);
        });
        it('is inaccessible to unauthenticated users', function () {
          authStub.rejects(new ForbiddenException());
          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
});
