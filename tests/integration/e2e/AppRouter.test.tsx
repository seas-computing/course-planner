import React from 'react';
import { render } from '@testing-library/react';
import { Test, TestingModule } from '@nestjs/testing';
import {
  stub, SinonStub,
} from 'sinon';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dummy from 'testData';
import { SessionModule } from 'nestjs-session';
import { MemoryRouter } from 'react-router-dom';
import App from 'client/components/App';
import request from 'client/api/request';
import { UnauthorizedException } from '@nestjs/common';
import mockAdapter from '../../mocks/api/adapter';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import { AUTH_MODE } from '../../../src/common/constants';
import { PopulationModule } from '../../mocks/database/population/population.module';
import { CourseModule } from '../../../src/server/course/course.module';
import { BadRequestExceptionPipe } from '../../../src/server/utils/BadRequestExceptionPipe';
import { MetadataModule } from '../../../src/server/metadata/metadata.module';
import { LocationModule } from '../../../src/server/location/location.module';
import { MeetingModule } from '../../../src/server/meeting/meeting.module';
import { FacultyModule } from '../../../src/server/faculty/faculty.module';
import { CourseInstanceModule } from '../../../src/server/courseInstance/courseInstance.module';
import { UserController } from '../../../src/server/user/user.controller';
import { LogModule } from '../../../src/server/log/log.module';

describe('Application Routing and Authorization', function () {
  let testModule: TestingModule;
  let authStub: SinonStub;
  const currentAcademicYear = 2019;
  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');
    const fakeConfig = new ConfigService(this.database.connectionEnv);
    // Stub out the academicYear getter to lock us to a known year. Otherwise,
    // tests might fail in the future if our test data don't include that year.
    stub(fakeConfig, 'academicYear').get(() => currentAcademicYear);
    stub(fakeConfig, 'logLevel').get(() => 'error');
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
        LogModule,
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
        FacultyModule,
        CourseInstanceModule,
        MetadataModule,
        LocationModule,
        MeetingModule,
      ],
      controllers: [
        UserController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfig)
      .compile();
    const nestApp = await testModule
      .createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
    const api = nestApp.getHttpServer();
    request.defaults.adapter = mockAdapter(api);
  });
  afterEach(async function () {
    return testModule.close();
  });
  context('When there is a logged-in user', function () {
    context('With an Admin User', function () {
      beforeEach(function () {
        authStub.resolves(dummy.adminUser);
      });
      context('/', function () {
        it('redirects to the courses component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Is SEAS?/);
        });
      });
      context('/course-admin', function () {
        it('renders the CourseAdmin component', function () {
          const { findByTestId } = render(
            <MemoryRouter initialEntries={['/course-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByTestId(/courseAdminPage/);
        });
      });
      context('/faculty-admin', function () {
        it('renders the FacultyAdmin component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/faculty-admin']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/HUID/);
        });
      });
      context('/room-admin', function () {
        it('renders the RoomAdmin component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/room-admin']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Building/);
        });
      });
      context('/faculty', function () {
        it('renders the Faculty component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/faculty']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Sabbatical Leave/);
        });
      });
      context('/courses', function () {
        it('renders the Courses component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/courses']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Is SEAS?/);
        });
      });
      context('/four-year-plan', function () {
        it('renders the MultiYearPlan component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/four-year-plan']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Catalog Prefix|Catalog Number|Title/);
        });
      });
      context('/schedule', function () {
        it('renders the Schedule component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/schedule']}>
              <App />
            </MemoryRouter>
          );
          return findByText('Select Semester');
        });
      });
      context('/room-schedule', function () {
        it('renders the Room Schedule component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/room-schedule']}>
              <App />
            </MemoryRouter>
          );
          return findByText('Select a room', { exact: false });
        });
      });
      context('Undefined routes', function () {
        it('renders the NoMatch component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/foobar']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/404/);
        });
      });
    });
    context('With a Read-Only User', function () {
      beforeEach(function () {
        authStub.resolves(dummy.readOnlyUser);
      });
      context('/', function () {
        it('redirects to the courses component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Is SEAS?/);
        });
      });
      context('/course-admin', function () {
        it('renders the NoMatch component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/course-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/403/);
        });
      });
      context('/faculty-admin', function () {
        it('renders the NoMatch component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/faculty-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/403/);
        });
      });
      context('/room-admin', function () {
        it('renders the NoMatch component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/room-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/403/);
        });
      });
      context('/faculty', function () {
        it('renders the Faculty component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/faculty']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Sabbatical Leave/);
        });
      });
      context('/courses', function () {
        it('renders the Courses component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/courses']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Is SEAS?/);
        });
      });
      context('/four-year-plan', function () {
        it('renders the MultiYearPlan component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/four-year-plan']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Catalog Prefix|Catalog Number|Title/);
        });
      });
      context('/schedule', function () {
        it('renders the Schedule component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/schedule']}>
              <App />
            </MemoryRouter>
          );
          return findByText('Select Semester');
        });
      });
      context('/room-schedule', function () {
        it('renders the Room Schedule component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/room-schedule']}>
              <App />
            </MemoryRouter>
          );
          return findByText('Select a room', { exact: false });
        });
      });
      context('Undefined routes', function () {
        it('renders the NoMatch component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/foobar']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/404/);
        });
      });
    });
  });
  context('When there is no user in context', function () {
    beforeEach(function () {
      authStub.rejects(new UnauthorizedException());
    });
    context('On the private site', function () {
      beforeEach(function () {
        const privateLocation = new URL(process.env.CLIENT_URL);
        stub(window, 'location').get(() => privateLocation);
      });
      context('/', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/401/);
        });
      });
      context('/course-admin', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/course-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/faculty-admin', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/faculty-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/room-admin', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/room-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/faculty', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/faculty']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/courses', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/courses']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/four-year-plan', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/four-year-plan']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/401/);
        });
      });
      context('/schedule', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/schedule']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/room-schedule', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/room-schedule']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('Undefined routes', function () {
        it('renders the NoMatch component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/foobar']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/404/);
        });
      });
    });
    context('On the public site', function () {
      beforeEach(function () {
        const publicLocation = new URL(process.env.PUBLIC_CLIENT_URL);
        stub(window, 'location').get(() => publicLocation);
      });
      context('/', function () {
        it('redirects to the four-year-plan component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Catalog Prefix|Catalog Number|Title/);
        });
      });
      context('/course-admin', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/course-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/faculty-admin', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/faculty-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/room-admin', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/room-admin']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/faculty', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/faculty']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/courses', function () {
        it('renders the UnauthorizedPage component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/courses']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/401/);
        });
      });
      context('/four-year-plan', function () {
        it('renders the four-year-plan component', function () {
          const { findAllByText } = render(
            <MemoryRouter initialEntries={['/four-year-plan']}>
              <App />
            </MemoryRouter>
          );
          return findAllByText(/Catalog Prefix|Catalog Number|Title/);
        });
      });
      context('/schedule', function () {
        it('renders the Schedule component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/schedule']}>
              <App />
            </MemoryRouter>
          );
          return findByText('Select Semester');
        });
      });
      context('/room-schedule', function () {
        it('renders the Room Schedule component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/room-schedule']}>
              <App />
            </MemoryRouter>
          );
          return findByText('Select a room', { exact: false });
        });
      });
      context('Undefined routes', function () {
        it('renders the NoMatch component', function () {
          const { findByText } = render(
            <MemoryRouter initialEntries={['/foobar']}>
              <App />
            </MemoryRouter>
          );
          return findByText(/404/);
        });
      });
    });
  });
});
