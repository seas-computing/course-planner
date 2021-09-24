import { Test, TestingModule } from '@nestjs/testing';
import React from 'react';
import {
  stub,
} from 'sinon';
import {
  render,
  RenderResult,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import request from 'client/api/request';
import { SessionModule } from 'nestjs-session';
import * as dummy from 'testData';
import { Repository } from 'typeorm';
import { Faculty } from 'server/faculty/faculty.entity';
import { UserController } from 'server/user/user.controller';
import { MemoryRouter } from 'react-router-dom';
import App from 'client/components/App';
import { strictEqual } from 'assert';
import { MetadataModule } from 'server/metadata/metadata.module';
import mockAdapter from '../../mocks/api/adapter';
import MockDB from '../../mocks/database/MockDB';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import { AUTH_MODE, FACULTY_TYPE } from '../../../src/common/constants';
import { FacultyModule } from '../../../src/server/faculty/faculty.module';
import { BadRequestExceptionPipe } from '../../../src/server/utils/BadRequestExceptionPipe';
import { PopulationModule } from '../../mocks/database/population/population.module';

describe('End-to-end Faculty Admin updating', function () {
  let db: MockDB;
  let testModule: TestingModule;
  let facultyRepository: Repository<Faculty>;
  const facultyName = 'David Malan';
  const [firstName, lastName] = facultyName.split(' ');
  before(async function () {
    db = new MockDB();
    return db.init();
  });
  after(async function () {
    return db.stop();
  });
  beforeEach(async function () {
    stub(TestingStrategy.prototype, 'login').resolves(dummy.adminUser);
    const fakeConfig = new ConfigService(db.connectionEnv);
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
        FacultyModule,
        MetadataModule,
      ],
      controllers: [
        UserController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfig)
      .compile();
    facultyRepository = testModule.get(
      getRepositoryToken(Faculty)
    );
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
  describe('Updating Faculty', function () {
    let renderResult: RenderResult;
    beforeEach(async function () {
      await facultyRepository.findOneOrFail({ lastName });
      renderResult = render(
        <MemoryRouter initialEntries={['/faculty-admin']}>
          <App />
        </MemoryRouter>
      );
    });
    context('Updating existing faculty information', function () {
      beforeEach(async function () {
        await renderResult.findByText(lastName);
        const editButton = await renderResult.findByLabelText(`Edit faculty information for ${firstName} ${lastName}`,
          { exact: false });
        fireEvent.click(editButton);
        return renderResult.findByRole('dialog');
      });
      context('when the modal submit button is clicked', function () {
        context('when the user attempts to exit the modal', function () {
          it('should not show an unsaved changes warning', async function () {
            // Set new category for faculty entry
            const categorySelector = await renderResult.findByLabelText('Category', { exact: false });
            fireEvent.change(categorySelector,
              { target: { value: FACULTY_TYPE.LADDER } });
            // click save
            const submitButton = renderResult.getByText('Submit');
            fireEvent.click(submitButton);
            await waitForElementToBeRemoved(() => renderResult.queryByText('Submit'));
            const modal = renderResult.queryByRole('dialog');
            strictEqual(modal, null);
          });
        });
      });
      context('when the modal submit button is not clicked', function () {
        context('when the user attempts to exit the modal', function () {
          it('should show an unsaved changes warning', async function () {
            // Set new category for faculty entry
            const categorySelector = await renderResult.findByLabelText('Category', { exact: false });
            fireEvent.change(categorySelector,
              { target: { value: FACULTY_TYPE.LADDER } });
            const windowConfirmStub = stub(window, 'confirm');
            windowConfirmStub.returns(true);
            // Attempt to close the modal without saving
            const cancelButton = await renderResult.findByText('Cancel');
            fireEvent.click(cancelButton);
            strictEqual(windowConfirmStub.callCount, 1);
          });
        });
      });
    });
  });
});
