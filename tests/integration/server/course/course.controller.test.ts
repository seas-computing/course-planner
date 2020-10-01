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
  physicsCourseResponse,
} from 'testData';
import { Semester } from 'server/semester/semester.entity';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { Area } from 'server/area/area.entity';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { SelectQueryBuilder } from 'typeorm';
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
          mockCourseRepository.save.resolves(computerScienceCourse);

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
          mockAreaRepository.findOne.resolves(computerScienceCourse.area.name);
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
        it('reports a validation error when an existing and new area are not provided', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.save.resolves(computerScienceCourse);
          const response = await request(api)
            .post('/api/courses')
            .send({
              title: computerScienceCourse.title,
              prefix: computerScienceCourse.prefix,
              number: computerScienceCourse.number,
              termPattern: computerScienceCourse.termPattern,
              isUndergraduate: computerScienceCourse.isUndergraduate,
              isSEAS: computerScienceCourse.isSEAS,
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('does not report a validation error when a new area is entered', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.save.resolves(computerScienceCourse);
          const response = await request(api)
            .post('/api/courses')
            .send({
              area: 'NA',
              title: computerScienceCourse.title,
              prefix: computerScienceCourse.prefix,
              number: computerScienceCourse.number,
              termPattern: computerScienceCourse.termPattern,
              isUndergraduate: computerScienceCourse.isUndergraduate,
              isSEAS: computerScienceCourse.isSEAS,
            });
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
        });
        it('reports a validation error when course number is missing', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.save.resolves(computerScienceCourse);
          const response = await request(api)
            .post('/api/courses')
            .send({
              area: computerScienceCourse.area,
              title: computerScienceCourse.title,
              termPattern: computerScienceCourse.termPattern,
              isUndergraduate: computerScienceCourse.isUndergraduate,
              isSEAS: computerScienceCourse.isSEAS,
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('reports a validation error when course title is missing', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.save.resolves(computerScienceCourse);
          const response = await request(api)
            .post('/api/courses')
            .send({
              area: computerScienceCourse.area,
              prefix: computerScienceCourse.prefix,
              number: computerScienceCourse.number,
              termPattern: computerScienceCourse.termPattern,
              isUndergraduate: computerScienceCourse.isUndergraduate,
              isSEAS: computerScienceCourse.isSEAS,
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('reports a validation error when Undergraduate is missing', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.save.resolves(computerScienceCourse);
          const response = await request(api)
            .post('/api/courses')
            .send({
              area: computerScienceCourse.area,
              prefix: computerScienceCourse.prefix,
              number: computerScienceCourse.number,
              title: computerScienceCourse.title,
              termPattern: computerScienceCourse.termPattern,
              isSEAS: computerScienceCourse.isSEAS,
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('reports a validation error when Is SEAS is missing', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.save.resolves(computerScienceCourse);
          const response = await request(api)
            .post('/api/courses')
            .send({
              area: computerScienceCourse.area,
              prefix: computerScienceCourse.prefix,
              number: computerScienceCourse.number,
              title: computerScienceCourse.title,
              termPattern: computerScienceCourse.termPattern,
              isUndergraduate: computerScienceCourse.isUndergraduate,
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('reports a validation error when term pattern is missing', async function () {
          authStub.resolves(adminUser);
          mockSemesterRepository.find.resolves([]);
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.save.resolves(computerScienceCourse);
          const response = await request(api)
            .post('/api/courses')
            .send({
              area: computerScienceCourse.area,
              title: computerScienceCourse.title,
              prefix: computerScienceCourse.prefix,
              number: computerScienceCourse.number,
              isUndergraduate: computerScienceCourse.isUndergraduate,
              isSEAS: computerScienceCourse.isSEAS,
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
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
            .put(`/api/courses/${computerScienceCourse.id}`)
            .send(updateCourseExample);

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(mockCourseRepository.find.callCount, 0);
        });
        it('updates the specified course', async function () {
          const newCourseInfo = {
            id: computerScienceCourse.id,
            area: computerScienceCourse.area.name,
            title: computerScienceCourse.title,
            prefix: computerScienceCourse.prefix,
            number: computerScienceCourse.number,
            termPattern: computerScienceCourse.termPattern,
            isUndergraduate: computerScienceCourse.isUndergraduate,
            isSEAS: computerScienceCourse.isSEAS,
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
        it('reports a validation error when an existing and new area are not provided', async function () {
          authStub.resolves(adminUser);
          const newCourseInfo = {
            id: computerScienceCourse.id,
            title: computerScienceCourse.title,
            prefix: computerScienceCourse.prefix,
            number: computerScienceCourse.number,
            termPattern: computerScienceCourse.termPattern,
            isUndergraduate: computerScienceCourse.isUndergraduate,
            isSEAS: computerScienceCourse.isSEAS,
            area: '',
          };
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.findOneOrFail.resolves(newCourseInfo.id);
          mockCourseRepository.save.resolves(newCourseInfo);
          const response = await request(api)
            .put(`/api/courses/${newCourseInfo.id}`)
            .send(newCourseInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('does not report a validation error when a new area is provided', async function () {
          authStub.resolves(adminUser);
          const newCourseInfo = {
            id: computerScienceCourse.id,
            title: computerScienceCourse.title,
            prefix: computerScienceCourse.prefix,
            number: computerScienceCourse.number,
            termPattern: computerScienceCourse.termPattern,
            isUndergraduate: computerScienceCourse.isUndergraduate,
            isSEAS: computerScienceCourse.isSEAS,
            area: 'NA',
          };
          mockAreaRepository.findOne.resolves(computerScienceCourse.area);
          mockCourseRepository.findOneOrFail.resolves(newCourseInfo.id);
          mockCourseRepository.save.resolves(newCourseInfo);
          const response = await request(api)
            .put(`/api/courses/${newCourseInfo.id}`)
            .send(newCourseInfo);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
          strictEqual(mockCourseRepository.save.callCount, 1);
        });
        it('reports a validation error when course number is missing', async function () {
          authStub.resolves(adminUser);
          const newCourseInfo = {
            id: computerScienceCourse.id,
            area: computerScienceCourse.area.name,
            title: computerScienceCourse.title,
            prefix: computerScienceCourse.prefix,
            termPattern: computerScienceCourse.termPattern,
            isUndergraduate: computerScienceCourse.isUndergraduate,
            isSEAS: computerScienceCourse.isSEAS,
          };
          mockAreaRepository.findOne.resolves(newCourseInfo.area);
          mockCourseRepository.findOneOrFail.resolves(newCourseInfo);
          mockCourseRepository.save.resolves(newCourseInfo);
          const response = await request(api)
            .put(`/api/courses/${newCourseInfo.id}`)
            .send(newCourseInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('reports a validation error when course title is missing', async function () {
          authStub.resolves(adminUser);
          const newCourseInfo = {
            id: computerScienceCourse.id,
            area: computerScienceCourse.area.name,
            prefix: computerScienceCourse.prefix,
            number: computerScienceCourse.number,
            termPattern: computerScienceCourse.termPattern,
            isUndergraduate: computerScienceCourse.isUndergraduate,
            isSEAS: computerScienceCourse.isSEAS,
          };
          mockAreaRepository.findOne.resolves(newCourseInfo.area);
          mockCourseRepository.findOneOrFail.resolves(newCourseInfo);
          mockCourseRepository.save.resolves(newCourseInfo);
          const response = await request(api)
            .put(`/api/courses/${computerScienceCourse.id}`)
            .send(newCourseInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('reports a validation error when Is SEAS is missing', async function () {
          authStub.resolves(adminUser);
          const newCourseInfo = {
            id: computerScienceCourse.id,
            area: computerScienceCourse.area.name,
            prefix: computerScienceCourse.prefix,
            number: computerScienceCourse.number,
            title: computerScienceCourse.title,
            termPattern: computerScienceCourse.termPattern,
            isUndergraduate: computerScienceCourse.isUndergraduate,
          };
          mockAreaRepository.findOne.resolves(newCourseInfo.area);
          mockCourseRepository.findOneOrFail.resolves(newCourseInfo);
          mockCourseRepository.save.resolves(newCourseInfo);
          const response = await request(api)
            .put(`/api/courses/${computerScienceCourse.id}`)
            .send(newCourseInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('reports a validation error when term pattern is missing', async function () {
          authStub.resolves(adminUser);
          const newCourseInfo = {
            id: computerScienceCourse.id,
            area: computerScienceCourse.area.name,
            title: computerScienceCourse.title,
            number: computerScienceCourse.number,
            prefix: computerScienceCourse.prefix,
            isUndergraduate: computerScienceCourse.isUndergraduate,
            isSEAS: computerScienceCourse.isSEAS,
          };
          mockAreaRepository.findOne.resolves(newCourseInfo.area);
          mockCourseRepository.findOneOrFail.resolves(newCourseInfo);
          mockCourseRepository.save.resolves(newCourseInfo);
          const response = await request(api)
            .put(`/api/courses/${newCourseInfo.id}`)
            .send(newCourseInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
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
