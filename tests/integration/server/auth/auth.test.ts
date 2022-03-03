import { Test, TestingModule } from '@nestjs/testing';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { SessionModule } from 'nestjs-session';
import {
  stub,
  SinonStub,
} from 'sinon';
import request from 'supertest';
import {
  HttpStatus,
  HttpServer,
} from '@nestjs/common';
import {
  strictEqual, notStrictEqual,
} from 'assert';
import { AUTH_MODE, GROUP } from 'common/constants';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { CourseModule } from 'server/course/course.module';
import { ConfigService } from 'server/config/config.service';
import * as dummy from 'testData';
import { CourseInstanceModule } from 'server/courseInstance/courseInstance.module';
import { FacultyModule } from 'server/faculty/faculty.module';
import { LocationModule } from 'server/location/location.module';
import { MeetingModule } from 'server/meeting/meeting.module';
import { MetadataModule } from 'server/metadata/metadata.module';
import { NonClassEventModule } from 'server/nonClassEvent/nonclassevent.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { UserController } from '../../../../src/server/user/user.controller';

/**
 * A set of test users, one for each of our permission levels, redefined here
 * to ensure that only the expected groups are included
 */

const testUsers = [
  {
    ...dummy.regularUser,
    firstName: 'Unprivileged',
    groups: [],
  },
  {
    ...dummy.regularUser,
    firstName: 'Read Only',
    groups: [GROUP.READ_ONLY],
  },
  {
    ...dummy.regularUser,
    firstName: 'Admin',
    groups: [GROUP.ADMIN],
  },
];

/**
 * Enumerates all of the endpoints in our app, along with the expected access permissions.
 * We don't care about the results of hitting these endpoints, just whether or
 * not a FORBIDDEN response is returned, based on the expected permissions.
 * This means we can get away with using dummy ids and not sending body data,
 */

interface Endpoint {
  path: string;
  method: 'get'|'post'|'put';
  expectAnonymousAccess: boolean;
  expectAllowedGroup: GROUP;
  // eslint-disable-next-line
  requestBody?: object; 
}

const endpointTests: Endpoint[] = [
  {
    path: '/api/courses/',
    method: 'get',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
  },
  {
    path: '/api/courses/',
    method: 'post',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
    requestBody: dummy.createCourseDtoExample,
  },
  {
    path: `/api/courses/${dummy.uuid}`,
    method: 'put',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
    requestBody: dummy.updateCourseExample,
  },
  {
    path: `/api/course-instances/?acadYear=${dummy.year}`,
    method: 'get',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.READ_ONLY,
  },
  {
    path: '/api/course-instances/multi-year-plan',
    method: 'get',
    expectAnonymousAccess: true,
    expectAllowedGroup: null,
  },
  {
    path: '/api/course-instances/schedule',
    method: 'get',
    expectAnonymousAccess: true,
    expectAllowedGroup: null,
  },
  {
    path: `/api/course-instances/${dummy.uuid}/instructors`,
    method: 'put',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
    requestBody: { instructors: [] },
  },
  {
    path: '/api/faculty/',
    method: 'get',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
  },
  {
    path: '/api/faculty/instructors',
    method: 'get',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
  },
  {
    path: '/api/faculty/schedule',
    method: 'get',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.READ_ONLY,
  },
  {
    path: `/api/faculty/absence/${dummy.uuid}`,
    method: 'put',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
    requestBody: dummy.facultyAbsenceRequest,
  },
  {
    path: `/api/faculty/${dummy.uuid}`,
    method: 'put',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
    requestBody: dummy.appliedMathFacultyMemberRequest,
  },
  {
    path: '/health-check/',
    method: 'get',
    expectAnonymousAccess: true,
    expectAllowedGroup: null,
  },
  {
    path: '/api/rooms/',
    method: 'get',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
  },
  {
    path: `/api/meetings/${dummy.uuid}`,
    method: 'put',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.ADMIN,
    requestBody: dummy.mondayMeetingWithRoom,
  },
  {
    path: '/api/metadata/',
    method: 'get',
    expectAnonymousAccess: true,
    expectAllowedGroup: null,
  },
  {
    path: '/api/non-class-events/',
    method: 'get',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.NON_CLASS,
  },
  {
    path: '/api/non-class-events/',
    method: 'post',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.NON_CLASS,
    requestBody: dummy.createNonClassParent,
  },
  {
    path: `/api/non-class-events/${dummy.uuid}`,
    method: 'put',
    expectAnonymousAccess: false,
    expectAllowedGroup: GROUP.NON_CLASS,
    requestBody: dummy.createNonClassParent,
  },
  {
    path: '/api/users/current/',
    method: 'get',
    expectAnonymousAccess: false,
    expectAllowedGroup: null,
  },
];

/**
 * Helper function that allows for dynamically calling different http methods
 * for each individual test.
 */
const requestMethod = async (
  api: HttpServer,
  endpoint: Endpoint
): Promise<request.Response> => {
  switch (endpoint.method) {
    case 'get': {
      return request(api).get(endpoint.path);
    }
    case 'post': {
      return request(api)
        .post(endpoint.path);
    }
    case 'put': {
      return request(api)
        .put(endpoint.path);
    }
    default: {
      throw new Error('Invalid request method provided');
    }
  }
};

describe('Authorization', function () {
  let testModule: TestingModule;
  let api: HttpServer;
  let authStub: SinonStub;
  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');
    testModule = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: {
            secret: dummy.string,
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
        CourseModule,
        CourseInstanceModule,
        FacultyModule,
        LocationModule,
        MeetingModule,
        MetadataModule,
        NonClassEventModule,
      ],
      controllers: [
        UserController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();
    const nestApp = await testModule.createNestApplication().init();
    api = nestApp.getHttpServer() as HttpServer;
  });
  afterEach(async function () {
    await testModule.close();
  });
  endpointTests.forEach((endpoint) => {
    describe(`${endpoint.method.toUpperCase()} ${endpoint.path}`, function () {
      testUsers.forEach((user) => {
        context(`As ${user.firstName} ${user.lastName}`, function () {
          beforeEach(function () {
            authStub.resolves(user);
          });
          if (
            // Anyone can access anonymous endpoints
            endpoint.expectAnonymousAccess
            || endpoint.expectAllowedGroup === null
            // Admins can access any endpoint
            || (user.groups.includes(GROUP.ADMIN))
            // Members of the allowed group can access their group's endpoints
            || user.groups.includes(endpoint.expectAllowedGroup)
            // Any member of any group can access read-only endpoints
            || (
              endpoint.expectAllowedGroup === GROUP.READ_ONLY
              && user.groups.some(
                (group) => Object.values(GROUP).includes(group)
              )
            )
          ) {
            it('should allow access', async function () {
              const result = await requestMethod(api, endpoint);
              notStrictEqual(result.status, HttpStatus.FORBIDDEN);
            });
          } else {
            it('Should deny access', async function () {
              const result = await requestMethod(api, endpoint);
              strictEqual(
                result.status,
                HttpStatus.FORBIDDEN
              );
            });
          }
        });
      });
      context('As an anonymous user', function () {
        if (endpoint.expectAnonymousAccess) {
          beforeEach(function () {
            authStub.resolves(null);
          });
          it('should allow access', async function () {
            const result = await requestMethod(api, endpoint);
            if (endpoint.expectAllowedGroup === null) {
              notStrictEqual(result.status, HttpStatus.UNAUTHORIZED);
            } else {
              notStrictEqual(result.status, HttpStatus.FORBIDDEN);
            }
          });
        } else {
          it('Should deny access', async function () {
            const result = await requestMethod(api, endpoint);
            if (endpoint.expectAllowedGroup === null) {
              strictEqual(
                result.status,
                HttpStatus.UNAUTHORIZED
              );
            } else {
              strictEqual(
                result.status,
                HttpStatus.FORBIDDEN
              );
            }
          });
        }
      });
    });
  });
});
