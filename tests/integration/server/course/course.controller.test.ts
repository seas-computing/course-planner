import { Test, TestingModule } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import { stub, SinonStub } from 'sinon';
import request from 'supertest';
import {
  HttpStatus,
  HttpServer,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { strictEqual, deepStrictEqual } from 'assert';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AUTH_MODE } from 'common/constants';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { Course } from 'server/course/course.entity';
import { CourseModule } from 'server/course/course.module';
import { ConfigService } from 'server/config/config.service';
import {
  regularUser,
  string,
  adminUser,
  computerScienceCourse,
  createCourseDtoExample,
} from 'common/__tests__/data';
import { Semester } from 'server/semester/semester.entity';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { Area } from 'server/area/area.entity';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

const mockAreaRepository = {
  findOneOrFail: stub(),
};

const mockCourseRepository = {
  find: stub(),
  save: stub(),
};

const mockSemesterRepository = {
  find: stub(),
};

describe('Course API', function () {
  let authStub: SinonStub;
  let api: HttpServer;

  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');

    const moduleRef: TestingModule = await Test.createTestingModule({
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
        CourseModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ NODE_ENV: 'development' }))

      .overrideProvider(getRepositoryToken(Area))
      .useValue(mockAreaRepository)

      .overrideProvider(getRepositoryToken(Course))
      .useValue(mockCourseRepository)

      .overrideProvider(getRepositoryToken(Semester))
      .useValue(mockSemesterRepository)

      .compile();

    const nestApp = await moduleRef.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();

    api = nestApp.getHttpServer();
  });
  afterEach(function () {
    authStub.restore();
    Object.values(mockCourseRepository)
      .forEach((sinonStub: SinonStub): void => {
        sinonStub.reset();
      });
  });
  describe('GET /courses', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/courses');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockCourseRepository.find.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        it('returns all the courses in the database', async function () {
          authStub.resolves(adminUser);
          const mockCourses = Array(10).fill(new Course());
          mockCourseRepository.find.resolves(mockCourses);

          const response = await request(api).get('/api/courses');

          strictEqual(response.ok, true);
          strictEqual(response.body.length, mockCourses.length);
          strictEqual(mockCourseRepository.find.callCount, 1);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.resolves(regularUser);

          const response = await request(api).get('/api/courses');

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.FORBIDDEN);
          strictEqual(mockCourseRepository.find.callCount, 0);
        });
      });
    });
  });

  describe('POST /courses', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/courses');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockCourseRepository.find.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        it('creates a single course', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockCourseRepository.save.resolves(computerScienceCourse);

          const response = await request(api)
            .post('/api/courses')
            .send(createCourseDtoExample);

          strictEqual(response.status, HttpStatus.CREATED);
          strictEqual(mockCourseRepository.save.callCount, 1);
          deepStrictEqual(
            mockCourseRepository.save.args[0][0],
            { ...createCourseDtoExample, instances: [] }
          );
        });
        it('returns the newly created course', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockCourseRepository.save.resolves(computerScienceCourse);

          const response = await request(api)
            .post('/api/courses')
            .send(createCourseDtoExample);

          deepStrictEqual(response.body, { ...createCourseDtoExample });
        });
        it('reports validation errors', async function () {
          authStub.resolves(adminUser);

          const response = await request(api)
            .post('/api/courses')
            .send({ title: computerScienceCourse.title });

          deepStrictEqual(response.ok, false);
          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(response.body.message.includes('prefix'), true);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.rejects(new UnauthorizedException());

          const response = await request(api)
            .post('/api/courses')
            .send(createCourseDtoExample);

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.UNAUTHORIZED);
          strictEqual(mockCourseRepository.find.callCount, 0);
        });
      });
    });
  });
});
