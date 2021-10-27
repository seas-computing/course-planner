import {
  ForbiddenException,
  HttpServer,
  HttpStatus,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { SinonStub, stub } from 'sinon';
import { TestingModule, Test } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import {
  nonClassEventManager,
  string,
  computationalModelingofFluidsReadingGroup,
  dataScienceReadingGroup,
  createNonClassParent,
  appliedMath,
  nonClassParent,
  updateNonClassParent,
  uuid,
  regularUser,
} from 'testData';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE } from 'common/constants';
import { ConfigService } from 'server/config/config.service';
import { strictEqual, deepStrictEqual } from 'assert';
import request from 'supertest';
import { NonClassEventService } from 'server/nonClassEvent/nonClassEvent.service';
import { NonClassEventController } from 'server/nonClassEvent/nonClassEvent.controller';
import { NonClassParentView } from 'server/nonClassEvent/NonClassParentView.entity';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Area } from 'server/area/area.entity';
import { NonClassParent } from 'server/nonClassEvent/nonclassparent.entity';
import { NonClassEventModule } from 'server/nonClassEvent/nonclassevent.module';
import { Repository } from 'typeorm';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import UpdateNonClassParentDTO from 'common/dto/nonClassMeetings/UpdateNonClassParent.dto';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

const mockAreaRepository = {
  findOneOrFail: stub(),
};

const mockNonClassEventService = {
  find: stub(),
  createWithNonClassEvents: stub(),
};

const mockParentRepository = {
  findOne: stub(),
};

describe('Non Class Event API', function () {
  let authStub: SinonStub;
  beforeEach(function () {
    authStub = stub(TestingStrategy.prototype, 'login');
  });
  describe('GET /', function () {
    let api: HttpServer;
    let app: INestApplication;
    beforeEach(async function () {
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
          {
            provide: getRepositoryToken(NonClassParent),
            useValue: mockParentRepository,
          },
        ],
        controllers: [
          NonClassEventController,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(new ConfigService({ NODE_ENV: 'development' }))

        .compile();

      app = await moduleRef.createNestApplication()
        .init();

      api = app.getHttpServer() as HttpServer;
    });
    afterEach(async function () {
      return app.close();
    });
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
  describe('POST /', function () {
    let api: HttpServer;
    let app: INestApplication;
    beforeEach(async function () {
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
          {
            provide: getRepositoryToken(NonClassParent),
            useValue: mockParentRepository,
          },
        ],
        controllers: [
          NonClassEventController,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(new ConfigService({ NODE_ENV: 'development' }))

        .compile();

      app = await moduleRef.createNestApplication()
        .init();

      api = app.getHttpServer() as HttpServer;
    });
    afterEach(async function () {
      return app.close();
    });
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api)
          .post('/api/non-class-events')
          .send(createNonClassParent);

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(
          mockNonClassEventService.createWithNonClassEvents.called,
          false
        );
      });
    });
    describe('User is authenticated', function () {
      describe('User is not authorized', function () {
        beforeEach(function () {
          authStub.rejects(new UnauthorizedException());
        });
        it('is inaccessible to unauthorized users', async function () {
          const response = await request(api)
            .post('/api/non-class-events')
            .send(createNonClassParent);

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.UNAUTHORIZED);
          strictEqual(
            mockNonClassEventService.createWithNonClassEvents.called,
            false
          );
        });
      });
      describe('User is authorized', function () {
        beforeEach(function () {
          authStub.resolves(nonClassEventManager);
        });
        it('creates non-class parent data', async function () {
          mockAreaRepository.findOneOrFail.resolves(appliedMath);
          mockNonClassEventService.createWithNonClassEvents
            .resolves(nonClassParent);

          const response = await request(api)
            .post('/api/non-class-events')
            .send(createNonClassParent);

          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
          strictEqual(
            mockNonClassEventService.createWithNonClassEvents.called,
            true
          );
        });
      });
    });
  });
  describe('PUT /:id', function () {
    let api: HttpServer;
    let nonClassParentRepository: Repository<NonClassParent>;
    let existingNonClassParent: NonClassParent;
    let app: INestApplication;
    beforeEach(async function () {
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
          NonClassEventModule,
          PopulationModule,
        ],
      })
        .overrideProvider(ConfigService)
        .useValue(new ConfigService(this.database.connectionEnv))
        .compile();

      app = await module.createNestApplication()
        .useGlobalPipes(new BadRequestExceptionPipe())
        .init();
      nonClassParentRepository = module
        .get<Repository<NonClassParent>>(getRepositoryToken(NonClassParent));

      existingNonClassParent = await nonClassParentRepository
        .findOne({ relations: ['area'] });

      api = app.getHttpServer() as HttpServer;
    });
    afterEach(function () {
      return app.close();
    });
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api)
          .put(`/api/non-class-events/${uuid}`)
          .send(updateNonClassParent);

        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    describe('User is authenticated', function () {
      describe('User is not authorized', function () {
        beforeEach(function () {
          authStub.rejects(new UnauthorizedException());
        });
        it('is inaccessible to unauthorized users', async function () {
          const response = await request(api)
            .put(`/api/non-class-events/${uuid}`)
            .send(updateNonClassParent);

          strictEqual(response.status, HttpStatus.UNAUTHORIZED);
        });
      });
      describe('User is authorized', function () {
        beforeEach(function () {
          authStub.resolves(nonClassEventManager);
        });
        it('updates non-class parent data', async function () {
          const { status, body: response } = await request(api)
            .put(`/api/non-class-events/${existingNonClassParent.id}`)
            .send({
              ...updateNonClassParent,
              area: existingNonClassParent.area.id,
              contactName: regularUser.fullName,
            } as UpdateNonClassParentDTO);

          strictEqual(status, HttpStatus.OK);
          strictEqual(existingNonClassParent.id, response.id);
          strictEqual(regularUser.fullName, response.contactName);
        });
        it('throws validation errors for invalid data', async function () {
          const { status } = await request(api)
            .put(`/api/non-class-events/${existingNonClassParent.id}`)
            .send({
              contactPhone: '1234',
            } as UpdateNonClassParentDTO);

          strictEqual(status, HttpStatus.BAD_REQUEST);
        });
      });
    });
  });
});
