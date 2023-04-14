import React from 'react';
import {
  fireEvent,
  BoundFunction,
  GetByText,
  FindByText,
  QueryByText,
  wait,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import request from 'client/api/request';
import supertest from 'supertest';
import { TestingModule, Test } from '@nestjs/testing';
import {
  getRepositoryToken,
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { AuthModule } from 'server/auth/auth.module';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { HttpServer, InternalServerErrorException } from '@nestjs/common';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { AUTH_MODE } from 'common/constants';
import { render } from 'test-utils';
import { SessionModule } from 'nestjs-session';
import { Repository } from 'typeorm';
import { LocationService } from 'server/location/location.service';
import { adminUser, createSEC555Room, string } from 'testData';
import { LocationModule } from 'server/location/location.module';
import { Campus } from 'server/location/campus.entity';
import { Building } from 'server/location/building.entity';
import CreateRoomModal from 'client/components/pages/RoomAdmin/CreateRoomModal';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { PopulationModule } from '../../../mocks/database/population/population.module';

/**
 * This class takes a supertest response with an error
 * and reshapes it into error with the same structure as AxiosError.
 */
class AxiosSupertestError extends Error {
  public response: supertest.Response;

  constructor(response) {
    super(response.error.message);
    this.response = {
      ...response,
      data: response.body,
    };
  }
}

describe('Room Admin Modal Behavior', function () {
  let getByText: BoundFunction<GetByText>;
  let findByText: BoundFunction<FindByText>;
  let queryByText: BoundFunction<QueryByText>;
  let getByLabelText: BoundFunction<GetByText>;
  let onSuccessStub: SinonStub;
  let onCloseStub: SinonStub;
  let postStub: SinonStub;
  let authStub: SinonStub;
  let locationService: LocationService;

  let testModule: TestingModule;
  let api: HttpServer;
  let supertestedApi: supertest.SuperTest<supertest.Test>;

  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');
    authStub.resolves(adminUser);
    testModule = await Test.createTestingModule({
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
        LocationModule,
        PopulationModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(Campus),
          useValue: new Repository<Campus>(),
        },
        {
          provide: getRepositoryToken(Building),
          useValue: new Repository<Building>(),
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();
    locationService = testModule.get<LocationService>(LocationService);
    const nestApp = await testModule.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();

    api = nestApp.getHttpServer() as HttpServer;
    supertestedApi = supertest(api);
  });
  afterEach(async function () {
    await testModule.close();
  });

  describe('rendering', function () {
    describe('validation errors', function () {
      context('when creating a room', function () {
        beforeEach(function () {
          postStub = stub(request, 'post');
          postStub = postStub.callsFake(async (url, data) => {
            const result = await supertestedApi.post(url)
              .send(data);
            // An error is not thrown for an error HTTP status,
            // so we must throw it ourselves.
            if (result.error) {
              throw new AxiosSupertestError(result);
            }
            return {
              ...result,
              data: result.body,
            };
          });
          onSuccessStub = stub();
          onCloseStub = stub();
          ({
            getByText,
            findByText,
            queryByText,
            getByLabelText,
          } = render(
            <CreateRoomModal
              isVisible
              onSuccess={onSuccessStub}
              onClose={onCloseStub}
            />
          ));
        });
        context('when required fields are not provided', function () {
          context('when Campus value is missing', function () {
            it('displays a validation error', async function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Campus is required', { exact: false });
            });
          });
          context('when Building value is missing', function () {
            it('displays a validation error', async function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Building is required', { exact: false });
            });
          });
          context('when Room Name value is missing', function () {
            it('displays a validation error', async function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Room number is required', { exact: false });
            });
          });
          context('when Capacity value is missing', function () {
            it('displays a validation error', async function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Capacity is required', { exact: false });
            });
          });
        });
        context('when required fields are provided', function () {
          it('does not display a validation error related to missing required fields', async function () {
            const campusSelect = getByLabelText('Campus', { exact: false }) as HTMLSelectElement;
            const buildingSelect = getByLabelText('Existing Building') as HTMLSelectElement;
            const roomNameInput = getByLabelText('Room Number', { exact: false }) as HTMLInputElement;
            const capacityInput = getByLabelText('Capacity', { exact: false }) as HTMLInputElement;
            fireEvent.change(
              campusSelect,
              { target: { value: createSEC555Room.campus } }
            );
            fireEvent.change(
              buildingSelect,
              { target: { value: createSEC555Room.building } }
            );
            fireEvent.change(
              roomNameInput,
              { target: { value: createSEC555Room.name } }
            );
            fireEvent.change(
              capacityInput,
              { target: { value: createSEC555Room.capacity } }
            );
            const submitButton = getByText('Submit');
            fireEvent.click(submitButton);
            await wait(() => !queryByText('required fields', { exact: false }));
          });
          context('when capacity value provided is not a number', function () {
            it('displays a validation error', async function () {
              const capacityInput = getByLabelText('Capacity', { exact: false }) as HTMLInputElement;
              fireEvent.change(
                capacityInput,
                { target: { value: 'Fifty' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Capacity is required to submit this form, and it must be a number.', { exact: false });
            });
          });
        });
      });
    });
    describe('other errors', function () {
      context('when creating a course', function () {
        beforeEach(function () {
          stub(locationService, 'createRoom').rejects(new InternalServerErrorException());
          onSuccessStub = stub();
          postStub = stub(request, 'post');
          postStub.callsFake(async (url, data) => {
            const result = await supertestedApi.post(url)
              .send(data);
            // An error is not thrown for an error HTTP status,
            // so we must throw it ourselves.
            if (result.error) {
              throw new AxiosSupertestError(result);
            }
            return {
              ...result,
              data: result.body,
            };
          });
          onCloseStub = stub();
          ({
            getByText,
            findByText,
            queryByText,
            getByLabelText,
          } = render(
            <CreateRoomModal
              isVisible
              onSuccess={onSuccessStub}
              onClose={onCloseStub}
            />
          ));
        });
        afterEach(function () {
          (locationService.createRoom as SinonStub).restore();
        });
        context('when there is an internal server error', function () {
          it('displays the error', async function () {
            const campusSelect = getByLabelText('Campus', { exact: false }) as HTMLSelectElement;
            const buildingSelect = getByLabelText('Existing Building') as HTMLSelectElement;
            const roomNameInput = getByLabelText('Room Number', { exact: false }) as HTMLInputElement;
            const capacityInput = getByLabelText('Capacity', { exact: false }) as HTMLInputElement;
            fireEvent.change(
              campusSelect,
              { target: { value: createSEC555Room.campus } }
            );
            fireEvent.change(
              buildingSelect,
              { target: { value: createSEC555Room.building } }
            );
            fireEvent.change(
              roomNameInput,
              { target: { value: createSEC555Room.name } }
            );
            fireEvent.change(
              capacityInput,
              { target: { value: createSEC555Room.capacity } }
            );
            const submitButton = getByText('Submit');
            fireEvent.click(submitButton);
            await wait(() => !queryByText('Internal Server Error', { exact: false }));
          });
        });
      });
    });
  });
});
