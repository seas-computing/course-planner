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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  strictEqual,
  deepStrictEqual,
} from 'assert';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import {
  FACULTY_TYPE,
  AUTH_MODE,
} from 'common/constants';
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
  adminUser,
} from 'common/__tests__/data';
import { SessionModule } from 'nestjs-session';
import { FacultyService } from 'server/faculty/faculty.service';
import { FacultyScheduleCourseView } from 'server/faculty/FacultyScheduleCourseView.entity';
import { FacultyScheduleSemesterView } from 'server/faculty/FacultyScheduleSemesterView.entity';
import { FacultyScheduleView } from 'server/faculty/FacultyScheduleView.entity';
import { Absence } from 'server/absence/absence.entity';
import { Semester } from 'server/semester/semester.entity';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

describe('Faculty API', function () {
  let authStub: SinonStub;
  let api: HttpServer;
  let mockFacultyService: Record<string, SinonStub>;
  let mockFacultyRepository: Record<string, SinonStub> = {};
  let mockAreaRepository: Record<string, SinonStub> = {};
  let mockAbsenceRepository: Record<string, SinonStub> = {};
  let mockSemesterRepository: Record<string, SinonStub> = {};
  let mockFacultyScheduleCourseViewRepository: Record<string, SinonStub> = {};
  let mockFacultyScheduleSemesterViewRepository: Record<string, SinonStub> = {};
  let mockFacultyScheduleViewRepository: Record<string, SinonStub> = {};
  let mockFacultyService: Record<string, SinonStub> = {};

  beforeEach(async function () {
    mockFacultyRepository = {
      create: stub(),
      save: stub(),
      findOneOrFail: stub(),
      find: stub(),
    };

    mockFacultyService = {
      find: stub(),
    };

    mockAreaRepository = {
      findOne: stub(),
      findOneOrFail: stub(),
      save: stub(),
    };
    mockAbsenceRepository = {};
    mockSemesterRepository = {};
    mockFacultyScheduleCourseViewRepository = {};
    mockFacultyScheduleSemesterViewRepository = {};
    mockFacultyScheduleViewRepository = {};

    authStub = stub(TestingStrategy.prototype, 'login');
    mockFacultyRepository = {
      create: stub(),
      save: stub(),
      findOneOrFail: stub(),
      find: stub(),
    };

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

      .overrideProvider(FacultyService)
      .useValue(mockFacultyService)

      .overrideProvider(getRepositoryToken(Area))
      .useValue(mockAreaRepository)

      .overrideProvider(getRepositoryToken(Semester))
      .useValue(mockSemesterRepository)

      .overrideProvider(getRepositoryToken(Absence))
      .useValue(mockAbsenceRepository)

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

    api = nestApp.getHttpServer() as HttpServer;
  });
  afterEach(function () {
    authStub.restore();
    [
      mockFacultyRepository,
      mockAreaRepository,
      mockFacultyService,
      mockAbsenceRepository,
      mockSemesterRepository,
      mockFacultyScheduleCourseViewRepository,
      mockFacultyScheduleSemesterViewRepository,
      mockFacultyScheduleViewRepository,
    ]
      .forEach((mock) => {
        Object.values(mock)
          .forEach((sinonStub: SinonStub): void => {
            sinonStub.reset();
          });
      });
  });

  describe('GET /', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/faculty');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyService.find.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        it('returns all faculty in the database', async function () {
          authStub.resolves(adminUser);
          const mockFaculty = Array(10).fill({
            ...new Faculty(),
            area: new Area(),
          });
          mockFacultyService.find.resolves(mockFaculty);

          const response = await request(api).get('/api/faculty');

          const body = response.body as Faculty[];

          strictEqual(response.ok, true);
          strictEqual(body.length, mockFaculty.length);
          strictEqual(mockFacultyService.find.callCount, 1);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.resolves(regularUser);

          const response = await request(api).get('/api/faculty');

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.FORBIDDEN);
          strictEqual(mockFacultyService.find.callCount, 0);
        });
      });
    });
  });
  describe('POST /', function () {
    describe('User is not authenticated', function () {
      beforeEach(function () {
        authStub.rejects(new ForbiddenException());
      });
      it('cannot create a faculty entry', async function () {
        const area = Object.assign(new Area(), {
          id: '8636efc3-6b3e-4c44-ba38-4e0e788dba43',
          name: 'ACS',
        });
        const faculty = Object.assign(new Faculty(), {
          id: 'b9122f78-af19-46a4-9655-29a932796739',
          HUID: '12345678',
          firstName: 'Sam',
          lastName: 'Johnston',
          category: FACULTY_TYPE.LADDER,
          area,
        });
        mockAreaRepository.findOne.resolves(area);
        mockAreaRepository.save.resolves(area);
        mockFacultyRepository.save.resolves(faculty);
        const response = await request(api)
          .post('/api/faculty')
          .send({
            HUID: faculty.HUID,
            firstName: faculty.firstName,
            lastName: faculty.lastName,
            category: faculty.category,
            area: faculty.area.name,
          });
        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyRepository.save.callCount, 0);
      });
    });

    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        beforeEach(function () {
          authStub.returns(adminUser);
        });
        it('creates a new faculty member in the database', async function () {
          const area = Object.assign(new Area(), {
            id: '8636efc3-6b3e-4c44-ba38-4e0e788dba43',
            name: 'ACS',
          });
          const faculty = Object.assign(new Faculty(), {
            id: 'b9122f78-af19-46a4-9655-29a932796739',
            HUID: '12345678',
            firstName: 'Sam',
            lastName: 'Johnston',
            category: FACULTY_TYPE.LADDER,
            area,
          });
          mockAreaRepository.findOne.resolves(area);
          mockAreaRepository.save.resolves(area);
          mockFacultyRepository.save.resolves(faculty);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: faculty.HUID,
              firstName: faculty.firstName,
              lastName: faculty.lastName,
              category: faculty.category,
              area: faculty.area.name,
            });
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
          deepStrictEqual(response.body, {
            ...faculty,
            area: {
              ...area,
            },
          });
        });
        it('reports validation errors', async function () {
          const area = Object.assign(new Area(), {
            id: '8636efc3-6b3e-4c44-ba38-4e0e788dba43',
            name: 'ACS',
          });
          const faculty = Object.assign(new Faculty(), {
            id: '2f4c8b5c-f06e-49cb-bea9-88e338794f31',
            firstName: 'Jen',
            category: FACULTY_TYPE.NON_LADDER,
            area,
          });
          mockAreaRepository.findOne.resolves(area);
          mockAreaRepository.save.resolves(area);
          mockFacultyRepository.save.resolves(faculty);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              firstName: faculty.lastName,
              category: faculty.category,
              area: faculty.area.name,
            });
          const body = response.body as BadRequestException;
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(/HUID/.test(body.message), true);
        });
        it('allows you to create a faculty member with a last name and no first name', async function () {
          const area = Object.assign(new Area(), {
            id: '8636efc3-6b3e-4c44-ba38-4e0e788dba43',
            name: 'ACS',
          });
          const faculty = Object.assign(new Faculty(), {
            id: '49372311-991d-45a7-a1bf-2ba967d62663',
            HUID: '12345678',
            lastName: 'Chen',
            category: FACULTY_TYPE.LADDER,
            area,
          });
          mockAreaRepository.findOne.resolves(area);
          mockAreaRepository.save.resolves(area);
          mockFacultyRepository.save.resolves(faculty);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: faculty.HUID,
              lastName: faculty.lastName,
              category: faculty.category,
              area: faculty.area.name,
            });
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
        });
        it('allows you to create a faculty member with a first name and no last name', async function () {
          const area = Object.assign(new Area(), {
            id: '8636efc3-6b3e-4c44-ba38-4e0e788dba43',
            name: 'ACS',
          });
          const faculty = Object.assign(new Faculty(), {
            id: '2f4c8b5c-f06e-49cb-bea9-88e338794f31',
            HUID: '12345678',
            firstName: 'Lisa',
            category: FACULTY_TYPE.NON_LADDER,
            area,
          });
          mockAreaRepository.findOne.resolves(area);
          mockAreaRepository.save.resolves(area);
          mockFacultyRepository.save.resolves(faculty);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: faculty.HUID,
              firstName: faculty.firstName,
              category: faculty.category,
              area: faculty.area.name,
            });
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
        });
        it('does not allow you to create a faculty member with both no first name and no last name', async function () {
          const area = Object.assign(new Area(), {
            id: '8636efc3-6b3e-4c44-ba38-4e0e788dba43',
            name: 'ACS',
          });
          const faculty = Object.assign(new Faculty(), {
            id: '2f4c8b5c-f06e-49cb-bea9-88e338794f31',
            HUID: '12345678',
            category: FACULTY_TYPE.NON_LADDER,
            area,
          });
          mockAreaRepository.findOne.resolves(area);
          mockAreaRepository.save.resolves(area);
          mockFacultyRepository.save.resolves(faculty);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: faculty.HUID,
              category: faculty.category,
              area: faculty.area.name,
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.returns(regularUser);

          const response = await request(api).get('/api/faculty');

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.FORBIDDEN);
          strictEqual(mockFacultyRepository.find.callCount, 0);
        });
      });
    });
  });
  describe('PUT /:id', function () {
    describe('User is not authenticated', function () {
      beforeEach(function () {
        authStub.rejects(new ForbiddenException());
      });
      it('cannot update a faculty entry', async function () {
        const faculty = Object.assign(new Faculty(), {
          id: 'b9122f78-af19-46a4-9655-29a932796739',
          HUID: '12345678',
          firstName: 'Sam',
          lastName: 'Johnston',
          category: FACULTY_TYPE.LADDER,
          area: 'ESE',
        });
        mockAreaRepository.findOneOrFail.resolves(faculty.area);
        mockAreaRepository.save.resolves(faculty.area);
        mockFacultyRepository.save.resolves(faculty);
        const response = await request(api)
          .put(`/api/faculty/${faculty.id}`)
          .send({
            id: faculty.id,
            HUID: faculty.HUID,
            firstName: faculty.firstName,
            lastName: faculty.lastName,
            category: faculty.category,
            area: faculty.area.name,
          });
        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyRepository.save.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        beforeEach(function () {
          authStub.returns(adminUser);
        });
        it('updates a faculty member entry in the database', async function () {
          const newFacultyMemberInfo = {
            id: 'df15cfff-0f6f-4769-8841-1ab8a9c335d9',
            HUID: '87654321',
            firstName: 'Grace',
            lastName: 'Hopper',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: 'AP',
          };
          mockAreaRepository.findOneOrFail.resolves(newFacultyMemberInfo.area);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put('/api/faculty/df15cfff-0f6f-4769-8841-1ab8a9c335d9')
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
        });
        it('reports validation errors', async function () {
          const response = await request(api)
            .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
            .send({
              id: 'g12gaa52-1gj5-ha21-1123-hn625632n123',
              HUID: '01234567',
              firstName: 'Ada',
              lastName: 'Lovelace',
              area: 'ESE',
            });
          const body = response.body as BadRequestException;
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(/category/.test(body.message), true);
        });
        it('allows you to update a faculty member so that the entry has a last name but no first name', async function () {
          const newFacultyMemberInfo = {
            id: '69694326-4d12-4c32-8a26-b2c28352ba31',
            HUID: '87654321',
            lastName: 'Hopper',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: 'BE',
          };
          mockAreaRepository.findOneOrFail.resolves(newFacultyMemberInfo.area);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put('/api/faculty/69694326-4d12-4c32-8a26-b2c28352ba31')
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
        });
        it('allows you to update a faculty member so that the entry has a first name but no last name', async function () {
          const newFacultyMemberInfo = {
            id: '69694326-4d12-4c32-8a26-b2c28352ba31',
            HUID: '87654321',
            firstName: 'Grace',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: 'ACS',
          };
          mockAreaRepository.findOneOrFail.resolves(newFacultyMemberInfo.area);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put(`/api/faculty/${newFacultyMemberInfo.id}`)
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
        });
        it('does not allow you to update faculty member so that the entry has neither first nor last name', async function () {
          const newFacultyMemberInfo = {
            id: 'g12gaa52-1gj5-ha21-1123-hn625632n123',
            HUID: '87654321',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: 'AP',
          };
          mockAreaRepository.findOneOrFail.resolves(newFacultyMemberInfo.area);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put(`/api/faculty/${newFacultyMemberInfo.id}`)
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('throws a Not Found exception if faculty does not exist', async function () {
          const newFacultyMemberInfo = {
            id: '69694326-4d12-4c32-8a26-b2c28352ba31',
            HUID: '87654321',
            lastName: 'Huntington',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: 'AP',
          };
          mockAreaRepository.findOneOrFail.resolves(newFacultyMemberInfo.area);
          mockFacultyRepository.findOneOrFail.rejects(new EntityNotFoundError(Faculty, `${newFacultyMemberInfo.id}`));
          mockFacultyRepository.save.rejects(new EntityNotFoundError(Faculty, `${newFacultyMemberInfo.id}`));
          const response = await request(api)
            .put(`/api/faculty/${newFacultyMemberInfo.id}`)
            .send(newFacultyMemberInfo);
          const body = response.body as NotFoundException;
          const message = body.message as string;
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(message.includes('Faculty'), true);
        });
        it('throws a Not Found exception if area does not exist', async function () {
          const newFacultyMemberInfo = {
            id: '69694326-4d12-4c32-8a26-b2c28352ba31',
            HUID: '87654321',
            lastName: 'Brown',
            category: FACULTY_TYPE.NON_LADDER,
            area: 'NA',
          };
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          mockAreaRepository.findOneOrFail.rejects(new EntityNotFoundError(Area, `${newFacultyMemberInfo.area}`));
          const response = await request(api)
            .put(`/api/faculty/${newFacultyMemberInfo.id}`)
            .send(newFacultyMemberInfo);
          const body = response.body as NotFoundException;
          const message = body.message as string;
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(response.body.message.includes('Area'), true);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.rejects(new ForbiddenException());

          const response = await request(api).get('/api/faculty');

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.FORBIDDEN);
          strictEqual(mockFacultyRepository.find.callCount, 0);
        });
      });
    });
  });
});
