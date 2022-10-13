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
import {
  strictEqual, deepStrictEqual, notStrictEqual, notDeepStrictEqual,
} from 'assert';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
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
import { Repository } from 'typeorm';
import RoomMeetingResponse from 'common/dto/room/RoomMeetingResponse.dto';
import RoomAdminResponse from 'common/dto/room/RoomAdminResponse.dto';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { rooms } from '../../../mocks/database/population/data/rooms';
import { courses } from '../../../mocks/database/population/data/courses';
import { Room } from '../../../../src/server/location/room.entity';
import { CourseInstance } from '../../../../src/server/courseInstance/courseinstance.entity';
import { Meeting } from '../../../../src/server/meeting/meeting.entity';
import { Semester } from '../../../../src/server/semester/semester.entity';
import { Course } from '../../../../src/server/course/course.entity';

describe('Location API', function () {
  let testModule: TestingModule;
  let authStub: SinonStub;
  let api: HttpServer;
  let locationRepo: Repository<Room>;
  let courseInstanceRepo: Repository<CourseInstance>;

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
      .useValue(new ConfigService(this.database.connectionEnv))

      .compile();

    locationRepo = testModule.get(getRepositoryToken(Room));
    courseInstanceRepo = testModule.get(getRepositoryToken(CourseInstance));
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
    let response: Response;
    context('As an unauthenticated user', function () {
      beforeEach(function () {
        authStub.resolves(null);
      });
      it('should return a 400 status', async function () {
        authStub.rejects(new ForbiddenException());

        response = await request(api)
          .get('/api/rooms');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    context('As an authenticated user', function () {
      let result: RoomResponse[];
      beforeEach(async function () {
        authStub.resolves(adminUser);
        response = await request(api)
          .get('/api/rooms');
        result = response.body;
      });
      it('should return a 200 status', function () {
        strictEqual(response.status, HttpStatus.OK);
      });
      it('should return a nonempty array of data', function () {
        strictEqual(Array.isArray(result), true);
        notStrictEqual(result.length, 0);
      });
      it('returns all rooms in the database', async function () {
        const actualRooms = result.map((room) => room.name).sort();
        const rawRooms = await locationRepo.createQueryBuilder('r')
          .select('CONCAT_WS(\' \', b.name, r.name)', 'name')
          .leftJoin('r.building', 'b')
          .getRawMany();
        const expectedRooms = rawRooms.map(({ name }) => <string>name).sort();
        deepStrictEqual(actualRooms, expectedRooms);
      });
    });
    context('As a non-admin user', function () {
      beforeEach(async function () {
        authStub.resolves(regularUser);
        response = await request(api)
          .get('/api/rooms');
      });
      it('is inaccessible to unauthenticated users', function () {
        authStub.rejects(new ForbiddenException());
        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
  });
  describe('GET /rooms/availability', function () {
    const testParams: RoomRequest = {
      calendarYear: '2020',
      term: TERM.FALL,
      day: DAY.MON,
      startTime: '10:00:00',
      endTime: '20:00:00',
    };
    context('As an unauthenticated user', function () {
      beforeEach(function () {
        authStub.resolves(null);
      });
      let response: Response;
      it('should return a 400 status', async function () {
        authStub.rejects(new ForbiddenException());

        response = await request(api)
          .get('/api/rooms/availability')
          .query(testParams);

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    context('As an authenticated user', function () {
      let response: Response;
      context('As an admin user', function () {
        context('With an invalid year', function () {
          let result: RoomMeetingResponse[];
          beforeEach(async function () {
            authStub.resolves(adminUser);
            const invalidYear = '1902';
            response = await request(api)
              .get('/api/rooms/availability')
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
              .get('/api/rooms/availability')
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
              .get('/api/rooms/availability')
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
              .get('/api/rooms/availability')
              .query({ ...testParams, startTime: invalidStartTime });
          });
          it('should return a 400 status', function () {
            strictEqual(response.status, HttpStatus.BAD_REQUEST);
          });
        });
        context('With an invalid end time', function () {
          beforeEach(async function () {
            authStub.resolves(adminUser);
            const invalidEndTime = '26:00:00';
            response = await request(api)
              .get('/api/rooms/availability')
              .query({ ...testParams, endTime: invalidEndTime });
          });
          it('should return a 400 status', function () {
            strictEqual(response.status, HttpStatus.BAD_REQUEST);
          });
        });
        context('With an invalid excludeParent', function () {
          beforeEach(async function () {
            authStub.resolves(adminUser);
            const invalidExcludeParent = 'notUUID';
            response = await request(api)
              .get('/api/rooms/availability')
              .query({ ...testParams, excludeParent: invalidExcludeParent });
          });
          it('should return a 400 status', function () {
            strictEqual(response.status, HttpStatus.BAD_REQUEST);
          });
        });
        context('With valid parameters', function () {
          let result: RoomMeetingResponse[];
          context('Without an excludeParent value', function () {
            beforeEach(async function () {
              authStub.resolves(adminUser);
              response = await request(api)
                .get('/api/rooms/availability')
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
            it('returns all rooms in the database', async function () {
              const actualRooms = result.map((room) => room.name);
              const rawRooms = await locationRepo.createQueryBuilder('r')
                .select('CONCAT_WS(\' \', b.name, r.name)', 'name')
                .leftJoin('r.building', 'b')
                .leftJoin('b.campus', 'c')
                .orderBy('c.name', 'ASC')
                .addOrderBy('b.name', 'ASC')
                .addOrderBy('r.name', 'ASC')
                .getRawMany();
              const expectedRooms = rawRooms.map(({ name }) => <string>name);
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
          context('With an excludeParent value', function () {
            let testInstance: Record<string, unknown>;
            beforeEach(async function () {
              authStub.resolves(adminUser);
              const testInstanceQuery = courseInstanceRepo
                .createQueryBuilder('ci')
                .select()
                .leftJoin(Meeting, 'm', 'm."courseInstanceId" = ci.id')
                .leftJoin(Semester, 's', 'ci."semesterId" = s.id')
                .leftJoinAndSelect(Course, 'c', 'ci."courseId" = c.id')
                .where('(m."startTime", m."endTime") OVERLAPS (:startTime::TIME, :endTime::TIME)')
                .andWhere('m."day" = :day')
                .andWhere('s."term" = :term')
                .andWhere('s."academicYear" = :calendarYear')
                .setParameters(testParams);
              testInstance = await testInstanceQuery
                .getRawOne();
              response = await request(api)
                .get('/api/rooms/availability')
                .query({
                  ...testParams,
                  excludeParent: testInstance.ci_id,
                });
              result = response.body;
            });
            it('should return a 200 status', function () {
              strictEqual(response.status, HttpStatus.OK);
            });
            it('should return a nonempty array of data', function () {
              strictEqual(Array.isArray(result), true);
              notStrictEqual(result.length, 0);
            });
            it('returns all rooms in the database', async function () {
              const actualRooms = result.map((room) => room.name);
              const rawRooms = await locationRepo.createQueryBuilder('r')
                .select('CONCAT_WS(\' \', b.name, r.name)', 'name')
                .leftJoin('r.building', 'b')
                .leftJoin('b.campus', 'c')
                .orderBy('c.name', 'ASC')
                .addOrderBy('b.name', 'ASC')
                .addOrderBy('r.name', 'ASC')
                .getRawMany();
              const expectedRooms = rawRooms.map(({ name }) => <string>name);
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
              ))
                .sort();
              notDeepStrictEqual(actualMeetings, expectedMeetings);
              const filteredMeetings = expectedMeetings
                .filter((courseNumber) => (
                  courseNumber !== `${testInstance.c_prefix as string} ${testInstance.c_number as string}`));
              deepStrictEqual(actualMeetings, filteredMeetings);
            });
          });
        });
      });
      context('As a non-admin user', function () {
        beforeEach(async function () {
          authStub.resolves(regularUser);
          response = await request(api)
            .get('/api/rooms/availability')
            .query(testParams);
        });
        it('is inaccessible to unauthenticated users', function () {
          authStub.rejects(new ForbiddenException());
          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
  describe('GET /rooms/admin', function () {
    let response: Response;
    context('As an unauthenticated user', function () {
      beforeEach(function () {
        authStub.resolves(null);
      });
      it('should return a 400 status', async function () {
        authStub.rejects(new ForbiddenException());

        response = await request(api)
          .get('/api/rooms/admin');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    context('As an authenticated user', function () {
      let result: RoomAdminResponse[];
      beforeEach(async function () {
        authStub.resolves(adminUser);
        response = await request(api)
          .get('/api/rooms/admin');
        result = response.body;
      });
      it('returns all rooms in the database', async function () {
        let expectedRooms: RoomAdminResponse[] = await locationRepo.createQueryBuilder('r')
          .leftJoinAndSelect(
            'r.building',
            'building'
          )
          .leftJoinAndSelect(
            'building.campus',
            'campus'
          )
          .orderBy('campus.name', 'ASC')
          .addOrderBy('building.name', 'ASC')
          .addOrderBy('r.name', 'ASC')
          .getMany();
        expectedRooms = expectedRooms.map((room) => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          building: {
            id: room.building.id,
            name: room.building.name,
            campus: {
              id: room.building.campus.id,
              name: room.building.campus.name,
            },
          },
        }));
        deepStrictEqual(result, expectedRooms);
      });
    });
    context('As a non-admin user', function () {
      beforeEach(async function () {
        authStub.resolves(regularUser);
        response = await request(api)
          .get('/api/rooms/admin');
      });
      it('is inaccessible to unauthenticated users', function () {
        authStub.rejects(new ForbiddenException());
        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
  });
});
