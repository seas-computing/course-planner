import { ForbiddenException, HttpServer, HttpStatus } from '@nestjs/common';
import { SinonStub, stub } from 'sinon';
import { TestingModule, Test } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import { nonClassEventManager, string } from 'testData';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE } from 'common/constants';
import { ConfigService } from 'server/config/config.service';
import { strictEqual, deepStrictEqual } from 'assert';
import request from 'supertest';
import { NonClassEventService } from 'server/nonClassEvent/nonClassEvent.service';
import { NonClassEventController } from 'server/nonClassEvent/nonClassEvent.controller';
import {
  computationalModelingofFluidsReadingGroup,
  dataScienceReadingGroup,
} from 'common/__tests__/data/nonClassEvents';
import { NonClassParentView } from 'server/nonClassEvent/NonClassParentView.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Area } from 'server/area/area.entity';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

const mockAreaRepository = {
  findOne: stub(),
};

const mockNonClassEventService = {
  find: stub(),
};

describe('Non Class Event API', function () {
  let authStub: SinonStub;
  let api: HttpServer;

  beforeEach(async function () {
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
      ],
      providers: [
        {
          provide: NonClassEventService,
          useValue: mockNonClassEventService,
        },
        {
          provide: getRepositoryToken(Area),
          useValue: mockAreaRepository,
        },
      ],
      controllers: [
        NonClassEventController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ NODE_ENV: 'development' }))

      .compile();

    const nestApp = await moduleRef.createNestApplication()
      .init();

    api = nestApp.getHttpServer() as HttpServer;
  });
  describe('GET /', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/non-class-events');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockNonClassEventService.find.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      beforeEach(function () {
        authStub.resolves(nonClassEventManager);
      });
      it('it returns all the non-class events in the database', async function () {
        mockNonClassEventService.find.resolves([
          computationalModelingofFluidsReadingGroup,
          dataScienceReadingGroup,
        ]);

        const response = await request(api).get('/api/non-class-events');

        strictEqual(response.ok, true);
        strictEqual(response.status, HttpStatus.OK);
        strictEqual(mockNonClassEventService.find.callCount, 1);
        deepStrictEqual(
          Object.values(response.body as Record<string, NonClassParentView[]>)
            .reduce((acc, val) => acc.concat(val), []),
          [
            computationalModelingofFluidsReadingGroup,
            dataScienceReadingGroup,
          ]
        );
      });
    });
  });
});
