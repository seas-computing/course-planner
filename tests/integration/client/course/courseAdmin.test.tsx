import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  fireEvent,
  BoundFunction,
  GetByText,
  FindByText,
  QueryByText,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import request from 'client/api/request';
import supertest, { SuperTest } from 'supertest';
import { TestingModule, Test } from '@nestjs/testing';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { AuthModule } from 'server/auth/auth.module';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { CourseModule } from 'server/course/course.module';
import { HttpServer } from '@nestjs/common';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import {
  physicsCourseResponse,
  adminUser,
  string,
} from 'testData';
import { AUTH_MODE } from 'common/constants';
import { render } from 'test-utils';
import { SessionModule } from 'nestjs-session';
import CourseModal from 'client/components/pages/Courses/CourseModal';
import MockDB from '../../../mocks/database/MockDB';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

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

describe('Course Admin Modal Behavior', function () {
  let getByText: BoundFunction<GetByText>;
  let findByText: BoundFunction<FindByText>;
  let queryByText: BoundFunction<QueryByText>;
  let getByLabelText: BoundFunction<GetByText>;
  const dispatchMessage: SinonStub = stub();
  let onSuccessStub: SinonStub;
  let onCloseStub: SinonStub;
  let putStub: SinonStub;
  let postStub: SinonStub;
  let authStub: SinonStub;

  let db: MockDB;
  let testModule: TestingModule;
  let api: HttpServer;
  let supertestedApi: supertest.SuperTest<supertest.Test>;

  before(async function () {
    db = new MockDB();
    await db.init();
  });
  after(async function () {
    await db.stop();
  });
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
        CourseModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))

      .compile();

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
      context('when creating a course', function () {
        beforeEach(function () {
          postStub = stub(request, 'post');
        });
        context('when required fields are not provided', function () {
          beforeEach(function () {
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
              <CourseModal
                isVisible
                onSuccess={onSuccessStub}
                onClose={onCloseStub}
              />,
              dispatchMessage
            ));
          });
          context('when Area value is missing', function () {
            it('displays a validation error', async function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Area should not be empty', { exact: false });
            });
          });
          context('when Catalog Prefix value is missing', function () {
            it('does not display a validation error', function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              const catalogPrefixError = queryByText('Catalog Prefix should not be empty', { exact: false });
              strictEqual(catalogPrefixError, null);
            });
          });
          context('when Course Number value is missing', function () {
            it('does not display a validation error', function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              const courseNumberError = queryByText('Course Number should not be empty', { exact: false });
              strictEqual(courseNumberError, null);
            });
          });
          context('when Course Title value is missing', function () {
            it('displays a validation error', async function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Title should not be empty', { exact: false });
            });
          });
          context('when Same As value is missing', function () {
            it('does not display a validation error', function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              const sameAsError = queryByText('Same As should not be empty', { exact: false });
              strictEqual(sameAsError, null);
            });
          });
          context('when Is Undergraduate value is missing', function () {
            it('does not display a validation error', function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              const isUndergraduateError = queryByText('Is Undergraduate should not be empty', { exact: false });
              strictEqual(isUndergraduateError, null);
            });
          });
          context('when Is SEAS value is missing', function () {
            it('displays a validation error', async function () {
              const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
              // Is SEAS dropdown defaults to IS_SEAS.Y
              fireEvent.change(
                isSEASSelect,
                { target: { value: '' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Is SEAS should not be empty', { exact: false });
            });
          });
          context('when Is SEAS value is not a valid IS_SEAS enum value', function () {
            it('displays a validation error', async function () {
              const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
              fireEvent.change(
                isSEASSelect,
                { target: { value: 'invalidValue' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Is SEAS must be a valid enum value', { exact: false });
            });
          });
          context('when Term Pattern value is missing', function () {
            it('displays a validation error', async function () {
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Term Pattern should not be empty', { exact: false });
            });
          });
          context('when Term Pattern value is not a valid Term Pattern enum value', function () {
            it('displays a validation error', async function () {
              const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
              fireEvent.change(
                termPatternSelect,
                { target: { value: 'invalidValue' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Term Pattern must be a valid enum value', { exact: false });
            });
          });
        });
        context('when required fields are provided', function () {

        });
      });
      context('when editing a course', function () {
        beforeEach(function () {
          putStub = stub(request, 'put');
        });
        context('when required fields are not provided', function () {
          beforeEach(function () {
            putStub = putStub.callsFake(async (url, data) => {
              const result = await supertestedApi.put(url)
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
              <CourseModal
                isVisible
                currentCourse={physicsCourseResponse}
                onSuccess={onSuccessStub}
                onClose={onCloseStub}
              />,
              dispatchMessage
            ));
          });
          context('when Area value is missing', function () {
            it('displays a validation error', async function () {
              const existingAreaSelect = document.getElementById('existingArea') as HTMLSelectElement;
              fireEvent.change(
                existingAreaSelect,
                { target: { value: '' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Area should not be empty', { exact: false });
            });
          });
          context('when Catalog Prefix value is missing', function () {
            it('does not display a validation error', function () {
              const catalogPrefixInput = getByLabelText('Catalog Prefix', { exact: false }) as HTMLInputElement;
              fireEvent.change(
                catalogPrefixInput,
                { target: { value: '' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              const catalogPrefixError = queryByText('Catalog Prefix should not be empty', { exact: false });
              strictEqual(catalogPrefixError, null);
            });
          });
          context('when Course Number value is missing', function () {
            it('does not display a validation error', function () {
              const courseNumberInput = getByLabelText('Course Number', { exact: false }) as HTMLInputElement;
              fireEvent.change(
                courseNumberInput,
                { target: { value: '' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              const courseNumberError = queryByText('Course Number should not be empty', { exact: false });
              strictEqual(courseNumberError, null);
            });
          });
          context('when Course Title value is missing', function () {
            it('displays a validation error', async function () {
              const courseTitleInput = getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
              fireEvent.change(courseTitleInput, { target: { value: '' } });
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Title should not be empty', { exact: false });
            });
          });
          context('when Same As value is missing', function () {
            it('does not display a validation error', function () {
              const sameAsInput = getByLabelText('Same As', { exact: false }) as HTMLInputElement;
              fireEvent.change(sameAsInput, { target: { value: '' } });
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              const sameAsError = queryByText('Same As should not be empty', { exact: false });
              strictEqual(sameAsError, null);
            });
          });
          context('when Is Undergraduate value is missing', function () {
            it('does not display a validation error', function () {
              const isUndergraduate = getByLabelText('Undergraduate', { exact: false }) as HTMLSelectElement;
              fireEvent.change(isUndergraduate, { target: { checked: false } });
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              const isUndergraduateError = queryByText('Is Undergraduate should not be empty', { exact: false });
              strictEqual(isUndergraduateError, null);
            });
          });
          context('when Is SEAS value is not a valid IS_SEAS enum value', function () {
            it('displays a validation error', async function () {
              const isSEASSelect = getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
              fireEvent.change(
                isSEASSelect,
                { target: { value: 'invalidValue' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Is SEAS must be a valid enum value', { exact: false });
            });
          });
          context('when Term Pattern value is not a valid Term Pattern enum value', function () {
            it('displays a validation error', async function () {
              const termPatternSelect = getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
              fireEvent.change(
                termPatternSelect,
                { target: { value: 'invalidValue' } }
              );
              const submitButton = getByText('Submit');
              fireEvent.click(submitButton);
              await findByText('Term Pattern must be a valid enum value', { exact: false });
            });
          });
        });
        context('when required fields are provided', function () {

        });
      });
    });
  });
});
