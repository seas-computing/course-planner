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
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import {
  FACULTY_TYPE,
  AUTH_MODE,
  ABSENCE_TYPE,
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
  appliedMathFacultyMemberRequest,
  appliedMathFacultyMember,
  appliedMathFacultyMemberResponse,
  bioengineeringFacultyMember,
  newAreaFacultyMemberRequest,
  facultyAbsenceResponse,
  facultyAbsenceRequest,
} from 'testData';
import { SessionModule } from 'nestjs-session';
import { FacultyService } from 'server/faculty/faculty.service';
import { FacultyScheduleCourseView } from 'server/faculty/FacultyScheduleCourseView.entity';
import { FacultyScheduleSemesterView } from 'server/faculty/FacultyScheduleSemesterView.entity';
import { FacultyScheduleView } from 'server/faculty/FacultyScheduleView.entity';
import { Absence } from 'server/absence/absence.entity';
import { Semester } from 'server/semester/semester.entity';
import { BadRequestInfo } from 'client/components/pages/Courses/CourseModal';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { InstructorResponseDTO } from '../../../../src/common/dto/courses/InstructorResponse.dto';

describe('Faculty API', function () {
  let authStub: SinonStub;
  let api: HttpServer;
  let mockFacultyRepository: Record<string, SinonStub> = {};
  let mockAreaRepository: Record<string, SinonStub> = {};
  let mockAbsenceRepository: Record<string, SinonStub> = {};
  let mockSemesterRepository: Record<string, SinonStub> = {};
  let mockFacultyScheduleCourseViewRepository: Record<string, SinonStub> = {};
  let mockFacultyScheduleSemesterViewRepository: Record<string, SinonStub> = {};
  let mockFacultyScheduleViewRepository: Record<string, SinonStub> = {};
  let mockFacultyService: Record<string, SinonStub> = {};
  let mockCourseInstanceRepository: Record<string, SinonStub> = {};
  let mockNonClassEventRepository: Record<string, SinonStub> = {};

  beforeEach(async function () {
    mockFacultyRepository = {
      create: stub(),
      save: stub(),
      findOneOrFail: stub(),
      find: stub(),
    };

    mockFacultyService = {
      find: stub(),
      getInstructorList: stub(),
    };

    mockAreaRepository = {
      findOne: stub(),
      findOneOrFail: stub(),
      save: stub(),
    };
    mockAbsenceRepository = {
      findOneOrFail: stub(),
      save: stub(),
    };
    mockSemesterRepository = {};
    mockFacultyScheduleCourseViewRepository = {};
    mockFacultyScheduleSemesterViewRepository = {};
    mockFacultyScheduleViewRepository = {};
    mockCourseInstanceRepository = {};
    mockNonClassEventRepository = {};

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
      .useValue(new ConfigService())

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

      .overrideProvider(getRepositoryToken(CourseInstance))
      .useValue(mockCourseInstanceRepository)

      .overrideProvider(getRepositoryToken(NonClassEvent))
      .useValue(mockNonClassEventRepository)

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
  describe('GET /instructors', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/faculty/instructors');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyService.getInstructorList.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        it('returns all faculty in the database', async function () {
          authStub.resolves(adminUser);
          const mockInstructors = [
            appliedMathFacultyMember,
            bioengineeringFacultyMember,
          ].map(({ id, firstName, lastName }) => ({
            id,
            displayName: `${lastName}, ${firstName}`,
          }));

          mockFacultyService.getInstructorList.resolves(mockInstructors);

          const response = await request(api).get('/api/faculty/instructors');

          const body = response.body as InstructorResponseDTO[];

          strictEqual(response.ok, true);
          strictEqual(body.length, mockInstructors.length);
          strictEqual(mockFacultyService.getInstructorList.callCount, 1);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.resolves(regularUser);

          const response = await request(api).get('/api/faculty/instructors');

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
        mockAreaRepository.findOne.resolves(appliedMathFacultyMember.area);
        mockAreaRepository.save.resolves(appliedMathFacultyMember.area);
        mockFacultyRepository.save.resolves(appliedMathFacultyMember);
        const response = await request(api)
          .post('/api/faculty')
          .send(appliedMathFacultyMemberRequest);
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
          mockAreaRepository.findOne.resolves(appliedMathFacultyMember.area);
          mockAreaRepository.save.resolves(appliedMathFacultyMember.area);
          mockFacultyRepository.save.resolves(appliedMathFacultyMember);
          const response = await request(api)
            .post('/api/faculty')
            .send(appliedMathFacultyMemberRequest);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
          deepStrictEqual(response.body, appliedMathFacultyMemberResponse);
        });
        it('reports a validation error when HUID is missing', async function () {
          mockAreaRepository.findOne.resolves(appliedMathFacultyMember.area);
          mockAreaRepository.save.resolves(appliedMathFacultyMember.area);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              firstName: appliedMathFacultyMember.lastName,
              category: appliedMathFacultyMember.category,
              area: appliedMathFacultyMember.area.name,
            });
          const body = response.body as BadRequestInfo;
          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('HUID'), true);
        });
        it('reports a validation error when category is missing', async function () {
          mockAreaRepository.findOne.resolves(appliedMathFacultyMember.area);
          mockAreaRepository.save.resolves(appliedMathFacultyMember.area);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              firstName: appliedMathFacultyMember.lastName,
              HUID: '12345678',
              area: appliedMathFacultyMember.area.name,
            });
          const body = response.body as BadRequestInfo;
          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('category'), true);
        });
        it('does not require a first name', async function () {
          mockAreaRepository.findOne.resolves(appliedMathFacultyMember.area);
          mockAreaRepository.save.resolves(appliedMathFacultyMember.area);
          mockFacultyRepository.save.resolves(appliedMathFacultyMember);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: appliedMathFacultyMember.HUID,
              lastName: appliedMathFacultyMember.lastName,
              category: appliedMathFacultyMember.category,
              area: appliedMathFacultyMember.area.name,
            });
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
        });
        it('requires a last name', async function () {
          mockAreaRepository.findOne.resolves(appliedMathFacultyMember.area);
          mockAreaRepository.save.resolves(appliedMathFacultyMember.area);
          mockFacultyRepository.save.resolves(appliedMathFacultyMember);
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: appliedMathFacultyMember.HUID,
              firstName: appliedMathFacultyMember.firstName,
              category: appliedMathFacultyMember.category,
              area: appliedMathFacultyMember.area.name,
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('throws a Not Found exception if area does not exist', async function () {
          const newFacultyMemberInfo = {
            area: newAreaFacultyMemberRequest.area,
            HUID: newAreaFacultyMemberRequest.HUID,
            lastName: newAreaFacultyMemberRequest.lastName,
            category: FACULTY_TYPE.NON_LADDER,
          };
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          mockAreaRepository.findOneOrFail.rejects(new EntityNotFoundError(Area, `${newFacultyMemberInfo.area}`));
          const response = await request(api)
            .post('/api/faculty')
            .send(newFacultyMemberInfo);
          const { body } = response;
          const message = body.message as string;
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(message.includes('Area'), true);
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
        mockAreaRepository.findOneOrFail
          .resolves(appliedMathFacultyMember.area);
        mockAreaRepository.save.resolves(appliedMathFacultyMember.area);
        mockFacultyRepository.save.resolves(appliedMathFacultyMember);
        const response = await request(api)
          .put(`/api/faculty/${appliedMathFacultyMember.id}`)
          .send({
            id: appliedMathFacultyMember.id,
            HUID: appliedMathFacultyMember.HUID,
            firstName: appliedMathFacultyMember.firstName,
            lastName: appliedMathFacultyMember.lastName,
            category: appliedMathFacultyMember.category,
            area: appliedMathFacultyMember.area.name,
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
          const body = response.body as BadRequestInfo;
          // Collects all of the field names that contain errors
          const errorFields = [];
          body.message.map((errorInfo) => errorFields.push(errorInfo.property));
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(errorFields.includes('category'), true);
        });
        it('does not require a first name', async function () {
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
        it('requires a last name', async function () {
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
          const { body } = response;
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
          const { body } = response;
          const message = body.message as string;
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(message.includes('Area'), true);
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
  describe('PUT /absence/:id', function () {
    const updatedAbsence = {
      ...facultyAbsenceResponse,
      type: ABSENCE_TYPE.TEACHING_RELIEF,
    };
    describe('User is not authenticated', function () {
      beforeEach(function () {
        authStub.rejects(new ForbiddenException());
      });
      it('cannot update an absence entry', async function () {
        mockAbsenceRepository.findOneOrFail.resolves(facultyAbsenceResponse);
        mockAbsenceRepository.save.resolves(facultyAbsenceResponse);
        const response = await request(api)
          .put(`/api/faculty/absence/${facultyAbsenceRequest.id}`)
          .send(updatedAbsence);
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
          mockAbsenceRepository.findOneOrFail.resolves(facultyAbsenceResponse);
          mockAbsenceRepository.save.resolves(facultyAbsenceResponse);
          const response = await request(api)
            .put(`/api/faculty/absence/${facultyAbsenceRequest.id}`)
            .send(updatedAbsence);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
        });
        it('throws a Not Found exception if absence does not exist', async function () {
          mockAbsenceRepository.findOneOrFail.rejects(new EntityNotFoundError(Absence, `${facultyAbsenceResponse.id}`));
          mockAbsenceRepository.save.rejects(new EntityNotFoundError(Absence, `${facultyAbsenceResponse.id}`));
          const response = await request(api)
            .put(`/api/faculty/absence/${facultyAbsenceRequest.id}`)
            .send(updatedAbsence);
          const { body } = response;
          const message = body.message as string;
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(message.includes('Absence'), true);
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
