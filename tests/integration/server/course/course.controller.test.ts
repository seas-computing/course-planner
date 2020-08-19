import { Test, TestingModule } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import { stub, SinonStub } from 'sinon';
import request from 'supertest';
import {
  HttpStatus,
  HttpServer,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
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
  computerScienceCourseResponse,
  updateCourseExample,
} from 'common/__tests__/data';
import { Semester } from 'server/semester/semester.entity';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { Area } from 'server/area/area.entity';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { UpdateCourseDTO } from 'common/dto/courses/UpdateCourse.dto';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

describe('Course API', function () {
  let mockAreaRepository: Record<string, SinonStub>;
  let mockCourseRepository : Record<string, SinonStub>;

  let mockSemesterRepository : Record<string, SinonStub>;
  let authStub: SinonStub;
  let api: HttpServer;

  beforeEach(async function () {
    mockAreaRepository = {
      findOneOrFail: stub(),
    };

    mockCourseRepository = {
      find: stub(),
      findOneOrFail: stub(),
      save: stub(),
    };

    mockSemesterRepository = {
      find: stub(),
    };

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

    api = nestApp.getHttpServer() as HttpServer;
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
          const body = response.body as ManageCourseResponseDTO[];
          strictEqual(response.ok, true);
          strictEqual(body.length, mockCourses.length);
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

          deepStrictEqual(
            response.body as ManageCourseResponseDTO,
            computerScienceCourseResponse
          );
        });
        it('reports validation errors', async function () {
          authStub.resolves(adminUser);

          const response = await request(api)
            .post('/api/courses')
            .send({ title: computerScienceCourse.title });

          const body = response.body as BadRequestException;

          deepStrictEqual(response.ok, false);
          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(/prefix/.test(body.message), true);
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

  describe('PUT /courses/:id', function () {
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
        beforeEach(function () {
          authStub.returns(adminUser);
        });
        it('returns a 404 if the specified course does not exist', async function () {
          mockCourseRepository.findOneOrFail.rejects(new EntityNotFoundError(Course, ''));

          const response = await request(api)
            .put(`/api/courses/${computerScienceCourse.id}`)
            .send(updateCourseExample);

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(mockCourseRepository.find.callCount, 0);
        });
        it('updates the specified course', async function () {
          mockCourseRepository.findOneOrFail.resolves(computerScienceCourse);
          mockCourseRepository.save.resolves(computerScienceCourse);

          const response = await request(api)
            .put(`/api/courses/${computerScienceCourse.id}`)
            .send({
              title: 'Some other course name',
            } as UpdateCourseDTO);

          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
          strictEqual(mockCourseRepository.save.callCount, 1);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.rejects(new UnauthorizedException());

          const response = await request(api)
            .put(`/api/courses/${computerScienceCourse.id}`);

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.UNAUTHORIZED);
          strictEqual(mockCourseRepository.find.callCount, 0);
        });
      });
    });
  });
});
