import { LogModule } from 'server/log/log.module';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { stub, SinonStub } from 'sinon';
import { HttpServer } from '@nestjs/common';
import { LogService } from 'server/log/log.service';
import { AuthModule } from 'server/auth/auth.module';
import { LOG_LEVEL, AUTH_MODE } from 'common/constants';
import { strictEqual, deepStrictEqual } from 'assert';
import * as dummy from 'testData';
import { HealthCheckController } from 'server/healthCheck/healthCheck.controller';
import { SessionModule } from 'nestjs-session';
import { MockController } from '../../../mocks/controller/mock.controller';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

describe('LogInterceptor', function () {
  let api: HttpServer;
  let mockCtrl: MockController;
  let mockLogService: Record<LOG_LEVEL, SinonStub>;
  beforeEach(async function () {
    mockLogService = {
      error: stub(),
      warn: stub(),
      info: stub(),
      http: stub(),
      verbose: stub(),
      debug: stub(),
    };
    mockCtrl = new MockController();
    const moduleRef = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: {
            secret: dummy.safeString,
            resave: false,
            saveUninitialized: false,
          },
        }),
        ConfigModule,
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
        LogModule,
      ],
      controllers: [
        MockController,
        HealthCheckController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({
        LOG_LEVEL: LOG_LEVEL.DEBUG,
        NODE_ENV: 'testing',
      }))
      .overrideProvider(LogService)
      .useValue(mockLogService)
      .compile();
    mockCtrl = moduleRef.get(MockController);
    const nestApp = await moduleRef
      .createNestApplication()
      .init();
    api = nestApp.getHttpServer() as HttpServer;
  });
  context('With anonymous user', function () {
    beforeEach(function () {
      return request(api).get('/api/mock/123');
    });
    it('Should log a message about anonymous users to the verbose stream', function () {
      const [message, label] = mockLogService.verbose.args[0];
      strictEqual(
        label,
        `${MockController.name}#${mockCtrl.getOneCourse.name}`
      );
      strictEqual(message, 'Request made by anonymous user');
    });
  });
  context('With authenticated users', function () {
    beforeEach(function () {
      stub(TestingStrategy.prototype, 'login').resolves(dummy.regularUser);
      return request(api).get('/api/mock/auth');
    });
    it('Should log the user data to the verbose stream', function () {
      strictEqual(mockLogService.verbose.callCount >= 1, true);
      const [message, label] = mockLogService.verbose.args[0];
      deepStrictEqual(message, dummy.regularUser);
      strictEqual(label, `${MockController.name}#${mockCtrl.getAuthRoute.name}`);
    });
  });

  describe('Get requests', function () {
    context('endpoints that return a single entity', function () {
      beforeEach(function () {
        return request(api).get('/api/mock/123');
      });
      it('should log that the response contains one item in the verbose stream', function () {
        strictEqual(mockLogService.verbose.callCount >= 1, true);
        const [message, label] = mockLogService.verbose.args[1];
        strictEqual(label, `${MockController.name}#${mockCtrl.getOneCourse.name}`);
        strictEqual(
          message, 'Response includes data containing 1 item'
        );
      });
      it('should debug the full entity', function () {
        strictEqual(mockLogService.debug.callCount >= 1, true);
        const [message, label] = mockLogService.debug.args[0];
        strictEqual(label, `${MockController.name}#${mockCtrl.getOneCourse.name}`);
        deepStrictEqual(
          message, dummy.cs50CourseInstance
        );
      });
    });
    context('endpoints that return an array with one item', function () {
      beforeEach(function () {
        return request(api).get('/api/mock/one');
      });
      it('should log that the response contains one item in the verbose stream', function () {
        strictEqual(mockLogService.verbose.callCount >= 1, true);
        const [message, label] = mockLogService.verbose.args[1];
        strictEqual(label, `${MockController.name}#${mockCtrl.getArrayOfOneCourse.name}`);
        strictEqual(
          message, 'Response includes data containing 1 item'
        );
      });
      it('should debug the full entity', function () {
        strictEqual(mockLogService.debug.callCount >= 1, true);
        const [message, label] = mockLogService.debug.args[0];
        strictEqual(label, `${MockController.name}#${mockCtrl.getArrayOfOneCourse.name}`);
        deepStrictEqual(
          message, [dummy.cs50CourseInstance]
        );
      });
    });
    context('endpoints that return multiple entities', function () {
      beforeEach(function () {
        return request(api).get('/api/mock/multiple');
      });
      it('should log the number of items in the response to the verbose stream', function () {
        strictEqual(mockLogService.verbose.callCount >= 1, true);
        const [message, label] = mockLogService.verbose.args[1];
        strictEqual(label, `${MockController.name}#${mockCtrl.getAllCourses.name}`);
        strictEqual(
          message, 'Response includes data containing 2 items'
        );
      });
      it('should debug the full reponse body', function () {
        strictEqual(mockLogService.debug.callCount >= 1, true);
        const [message, label] = mockLogService.debug.args[0];
        strictEqual(label, `${MockController.name}#${mockCtrl.getAllCourses.name}`);
        deepStrictEqual(
          message,
          [dummy.cs50CourseInstance, dummy.ac209aCourseInstance]
        );
      });
    });
    context('requests to /health-check', function () {
      beforeEach(function () {
        return request(api).get('/health-check');
      });
      it('Should not log anything to the error stream', function () {
        strictEqual(mockLogService.error.callCount, 0);
      });
      it('Should not log anything to the warn stream', function () {
        strictEqual(mockLogService.warn.callCount, 0);
      });
      it('Should not log anything to the info stream', function () {
        strictEqual(mockLogService.info.callCount, 0);
      });
      it('Should not log anything to the http stream', function () {
        strictEqual(mockLogService.http.callCount, 0);
      });
      it('Should not log anything to the debug stream', function () {
        strictEqual(mockLogService.debug.callCount, 0);
      });
      it('Should not log anything to the verbose stream', function () {
        strictEqual(mockLogService.verbose.callCount, 0);
      });
    });
  });
  describe('POST requests', function () {
    context('When the request contains body data', function () {
      beforeEach(function () {
        return request(api).post('/api/mock').send(dummy.createCourseDtoExample);
      });
      it('Should log to the verbose stream that the request includes data', function () {
        strictEqual(mockLogService.verbose.callCount >= 1, true);
        const [message, label] = mockLogService.verbose.args[1];
        strictEqual(message, 'Request includes data');
        strictEqual(label, `${MockController.name}#${mockCtrl.addCourse.name}`);
      });
      it('Should log the request data to the debug stream', function () {
        strictEqual(mockLogService.debug.callCount >= 1, true);
        const [message, label] = mockLogService.debug.args[0];
        deepStrictEqual(message, { ...dummy.createCourseDtoExample });
        strictEqual(label, `${MockController.name}#${mockCtrl.addCourse.name}`);
      });
    });
    context('When the request does not contain body data', function () {
      beforeEach(function () {
        return request(api).post('/api/mock');
      });
      it('Should log to the verbose stream that the request does not include data', function () {
        strictEqual(mockLogService.verbose.callCount >= 1, true);
        const [message, label] = mockLogService.verbose.args[1];
        strictEqual(message, 'Request does not include any data');
        strictEqual(label, `${MockController.name}#${mockCtrl.addCourse.name}`);
      });
      it('Should not log anything to the debug stream', function () {
        // Will be called once for the response data
        strictEqual(mockLogService.debug.callCount, 1);
      });
    });
  });
});
