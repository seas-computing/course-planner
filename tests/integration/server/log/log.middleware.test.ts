import {
  Module, NestModule, MiddlewareConsumer, HttpServer, RequestMethod,
} from '@nestjs/common';
import request from 'supertest';
import { strictEqual } from 'assert';
import { LogMiddleware } from 'server/log/log.middleware';
import { Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { install as installClock, InstalledClock } from '@sinonjs/fake-timers';
import { ConfigModule } from 'server/config/config.module';
import { LogModule } from 'server/log/log.module';
import { LogService } from 'server/log/log.service';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE, LOG_LEVEL } from 'common/constants';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { MockController } from '../../../mocks/controller/mock.controller';

describe('LogMiddleware', function () {
  @Module({ imports: [LogModule] })
  class MiddlewareModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
      consumer
        .apply(LogMiddleware)
        .forRoutes({ path: '/api/', method: RequestMethod.ALL });
    }
  }

  let mockLogService: Partial<Record<LOG_LEVEL, SinonStub>>
  & { httpStream: { write: SinonStub } };
  let api: HttpServer;
  let clock: InstalledClock;
  before(function () {
    clock = installClock({ now: 0 });
  });
  after(function () {
    clock.uninstall();
  });
  beforeEach(async function () {
    mockLogService = {
      error: stub(),
      warn: stub(),
      info: stub(),
      http: stub(),
      verbose: stub(),
      debug: stub(),
      httpStream: {
        write: stub(),
      },
    };
    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
        LogModule,
        ConfigModule,
        MiddlewareModule,
      ],
      controllers: [
        MockController,
      ],
    })
      .overrideProvider(LogService)
      .useValue(mockLogService)
      .compile();
    const nestApp = await moduleRef.createNestApplication().init();
    api = nestApp.getHttpServer() as HttpServer;
  });
  context('Request logging', function () {
    let message: string;
    beforeEach(async function () {
      await request(api).get('/api/mock/one');
      ([[message]] = mockLogService.httpStream.write.args);
    });
    it('Should log the request to the httpStream', function () {
      strictEqual(mockLogService.httpStream.write.callCount, 1);
    });
    it('Should include the timestamp', function () {
      strictEqual(message.includes('01/Jan/1970:00:00:00 +0000'), true);
    });
    it('Should include the http method', function () {
      strictEqual(/GET/.test(message), true);
    });
    it('Should include the path', function () {
      strictEqual(/api\/mock\/one/.test(message), true);
    });
    it('Should include the response code', function () {
      strictEqual(/200/.test(message), true);
    });
  });
});
