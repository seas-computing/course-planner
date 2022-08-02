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
      updateFacultyAbsences: stub(),
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
});
