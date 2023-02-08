import { Test, TestingModule } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import {
  stub,
  SinonStub,
  SinonStubbedInstance,
  createStubInstance,
} from 'sinon';
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
  cs50Course,
  createCourseDtoExample,
  computerScienceCourseResponse,
  updateCourseExample,
  physicsCourseResponse,
} from 'testData';
import { Semester } from 'server/semester/semester.entity';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { Area } from 'server/area/area.entity';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { SelectQueryBuilder } from 'typeorm';
import { BadRequestInfo } from 'client/components/pages/Courses/CourseModal';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

describe('Course API', function () {
  let mockAreaRepository: Record<string, SinonStub>;
  let mockCourseRepository : Record<string, SinonStub>;
  let mockSemesterRepository : Record<string, SinonStub>;
  let authStub: SinonStub;
  let api: HttpServer;
  let mockCourseQueryBuilder: SinonStubbedInstance<SelectQueryBuilder<Course>>;
  const mockCourses: ManageCourseResponseDTO[] = [
    computerScienceCourseResponse,
    physicsCourseResponse,
  ];

  beforeEach(async function () {
    mockCourseQueryBuilder = createStubInstance(SelectQueryBuilder);
    mockCourseQueryBuilder.select.returnsThis();
    mockCourseQueryBuilder.addSelect.returnsThis();
    mockCourseQueryBuilder.leftJoinAndSelect.returnsThis();
    mockCourseQueryBuilder.orderBy.returnsThis();
    mockCourseQueryBuilder.addOrderBy.returnsThis();
    mockCourseQueryBuilder.getRawMany
      .resolves(mockCourses as unknown as Course[]);

    mockAreaRepository = {
      findOne: stub(),
    };

    mockCourseRepository = {
      createQueryBuilder: stub().returns(mockCourseQueryBuilder),
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
        strictEqual(mockCourseRepository.createQueryBuilder.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        it('returns all the courses in the database', async function () {
          authStub.resolves(adminUser);

          const response = await request(api).get('/api/courses');
          const body = response.body as ManageCourseResponseDTO[];
          strictEqual(response.ok, true);
          strictEqual(body.length, mockCourses.length);
          strictEqual(mockCourseRepository.createQueryBuilder.callCount, 1);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.resolves(regularUser);

          const response = await request(api).get('/api/courses');

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.FORBIDDEN);
          strictEqual(mockCourseRepository.createQueryBuilder.callCount, 0);
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
          mockAreaRepository.findOne
            .resolves(computerScienceCourseResponse.area);
          mockCourseRepository.save.resolves(cs50Course);

          const response = await request(api)
            .post('/api/courses')
            .send(createCourseDtoExample);
          strictEqual(response.status, HttpStatus.CREATED);
          strictEqual(mockCourseRepository.save.callCount, 1);
          deepStrictEqual(
            response.body,
            computerScienceCourseResponse
          );
        });
        it('returns the newly created course', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockAreaRepository.findOne.resolves(cs50Course.area.name);
          mockCourseRepository.save.resolves(cs50Course);

          const response = await request(api)
            .post('/api/courses')
            .send(createCourseDtoExample);

          deepStrictEqual(
            response.body as ManageCourseResponseDTO,
            computerScienceCourseResponse
          );
        });
        it('reports a validation error when area is missing', async function () {
          authStub.resolves(adminUser);

          const response = await request(api)
            .post('/api/courses')
            .send({ title: cs50Course.title });

          const body = response.body as BadRequestInfo;

          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));

          deepStrictEqual(response.ok, false);
          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('area'), true);
        });
        it('reports a validation error when title is missing', async function () {
          authStub.resolves(adminUser);

          const response = await request(api)
            .post('/api/courses')
            .send({ termPattern: cs50Course.termPattern });

          const body = response.body as BadRequestInfo;

          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));

          deepStrictEqual(response.ok, false);
          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('title'), true);
        });
        it('reports a validation error when isSEAS is missing', async function () {
          authStub.resolves(adminUser);

          const response = await request(api)
            .post('/api/courses')
            .send({ title: cs50Course.title });

          const body = response.body as BadRequestInfo;

          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));

          deepStrictEqual(response.ok, false);
          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('isSEAS'), true);
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
          mockAreaRepository.findOne.resolves('');
          mockCourseRepository.findOneOrFail.rejects(new EntityNotFoundError(Course, ''));

          const response = await request(api)
            .put(`/api/courses/${cs50Course.id}`)
            .send(updateCourseExample);

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(mockCourseRepository.find.callCount, 0);
        });
        it('updates the specified course', async function () {
          const newCourseInfo = {
            id: cs50Course.id,
            area: cs50Course.area.name,
            title: cs50Course.title,
            prefix: cs50Course.prefix,
            number: cs50Course.number,
            termPattern: cs50Course.termPattern,
            isUndergraduate: cs50Course.isUndergraduate,
            isSEAS: cs50Course.isSEAS,
          };
          mockCourseRepository.findOneOrFail.resolves(newCourseInfo);
          mockAreaRepository.findOne.resolves(newCourseInfo.area);
          mockCourseRepository.save.resolves(newCourseInfo);

          const response = await request(api)
            .put(`/api/courses/${newCourseInfo.id}`)
            .send(newCourseInfo);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
          strictEqual(mockCourseRepository.save.callCount, 1);
        });
        it('reports a validation error when area is missing', async function () {
          authStub.resolves(adminUser);

          const response = await request(api)
            .put(`/api/courses/${cs50Course.id}`)
            .send({ title: cs50Course.title });

          const body = response.body as BadRequestInfo;

          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));

          deepStrictEqual(response.ok, false);
          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('area'), true);
        });
        it('reports a validation error when title is missing', async function () {
          authStub.resolves(adminUser);

          const response = await request(api)
            .put(`/api/courses/${cs50Course.id}`)
            .send({ termPattern: cs50Course.termPattern });

          const body = response.body as BadRequestInfo;

          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));

          deepStrictEqual(response.ok, false);
          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('title'), true);
        });
        it('reports a validation error when isSEAS is missing', async function () {
          authStub.resolves(adminUser);

          const response = await request(api)
            .put(`/api/courses/${cs50Course.id}`)
            .send({ title: cs50Course.title });

          const body = response.body as BadRequestInfo;

          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));

          deepStrictEqual(response.ok, false);
          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('isSEAS'), true);
        });
        it('returns a 400 if the course is the "same as" itself', async function () {
          const response = await request(api)
            .put(`/api/courses/${cs50Course.id}`)
            .send({
              ...cs50Course,
              area: cs50Course.area.name,
              sameAs: cs50Course.id,
            });

          const body = response.body as BadRequestInfo;

          const errorFields = body.message.map(({ property }) => property);

          deepStrictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('sameAs'), true);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.rejects(new UnauthorizedException());

          const response = await request(api)
            .put(`/api/courses/${cs50Course.id}`);

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.UNAUTHORIZED);
          strictEqual(mockCourseRepository.find.callCount, 0);
        });
      });
    });
  });
});
