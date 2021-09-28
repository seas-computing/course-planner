import { Test, TestingModule } from '@nestjs/testing';
import React from 'react';
import {
  stub,
} from 'sinon';
import {
  RenderResult,
  fireEvent,
  waitForElementToBeRemoved,
  wait,
  render,
} from '@testing-library/react';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import request from 'client/api/request';
import { SessionModule } from 'nestjs-session';
import * as dummy from 'testData';
import { Repository } from 'typeorm';
import { UserController } from 'server/user/user.controller';
import { MemoryRouter } from 'react-router-dom';
import App from 'client/components/App';
import { strictEqual } from 'assert';
import { MetadataModule } from 'server/metadata/metadata.module';
import { Course } from 'server/course/course.entity';
import { CourseModule } from 'server/course/course.module';
import { physicsCourse } from 'testData';
import mockAdapter from '../../mocks/api/adapter';
import MockDB from '../../mocks/database/MockDB';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import { AUTH_MODE, IS_SEAS } from '../../../src/common/constants';
import { BadRequestExceptionPipe } from '../../../src/server/utils/BadRequestExceptionPipe';
import { PopulationModule } from '../../mocks/database/population/population.module';
import { CourseAdmin } from 'client/components/pages';

describe('End-to-end Course Admin updating', function () {
  let db: MockDB;
  let testModule: TestingModule;
  let courseRepository: Repository<Course>;
  const title = 'Introduction to Soft Matter';
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
        CourseModule,
        MetadataModule,
      ],
      controllers: [
        UserController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfig)
      .compile();
    courseRepository = testModule.get(
      getRepositoryToken(Course)
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
  describe('Updating Courses', function () {
    let renderResult: RenderResult;
    beforeEach(async function () {
      await courseRepository.findOneOrFail({ title });
      renderResult = render(
        <MemoryRouter initialEntries={['/course-admin']}>
          <App />
        </MemoryRouter>
      );
    });
    context('Creating a course', function () {
      beforeEach(async function () {
        await renderResult.findByText('Create New Course');
        const createCourseButton = await renderResult.findByText('Create New Course', { exact: false });
        fireEvent.click(createCourseButton);
        await renderResult.findByText(/Select an existing area/);
        const existingAreaSelect = renderResult.getByLabelText('Existing Area', { exact: true }) as HTMLSelectElement;
        const courseTitleInput = renderResult.getByLabelText('Course Title', { exact: false }) as HTMLInputElement;
        const isSEASSelect = renderResult.getByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
        const termPatternSelect = renderResult.getByLabelText('Term Pattern', { exact: false }) as HTMLSelectElement;
        fireEvent.change(existingAreaSelect, { target: { value: `${physicsCourse.area.name}` } });
        fireEvent.change(courseTitleInput, { target: { value: `${physicsCourse.title}` } });
        fireEvent.change(isSEASSelect, { target: { value: `${physicsCourse.isSEAS}` } });
        fireEvent.change(termPatternSelect, { target: { value: `${physicsCourse.termPattern}` } });
      });
      context('when the modal submit button is clicked', function () {
        it.only('should not show the unsaved changes warning', async function () {
          const submitButton = renderResult.getByText('Submit');
          fireEvent.click(submitButton);
          await waitForElementToBeRemoved(() => renderResult.queryByText('Select an existing area'));
          const modal = renderResult.queryByRole('dialog');
          strictEqual(modal, null);
        });
      });
      context('when the modal submit button is not clicked', function () {
        it('should show the unsaved changes warning', async function () {
          const windowConfirmStub = stub(window, 'confirm');
          windowConfirmStub.returns(true);
          // Attempt to close the modal without saving
          const cancelButton = await renderResult.findByText('Cancel');
          fireEvent.click(cancelButton);
          strictEqual(windowConfirmStub.callCount, 1);
        });
      });
    });
    context('Updating existing course information', function () {
      beforeEach(async function () {
        await renderResult.findByText(title);
        const editButton = await renderResult.findByLabelText(`Edit course information for ${title}`,
          { exact: false });
        fireEvent.click(editButton);
        return renderResult.findByRole('dialog');
      });
      context('when the modal submit button is clicked', function () {
        it('should not show an unsaved changes warning', async function () {
          // Set new isSEAS category for course entry
          const isSEASSelector = await renderResult.findByLabelText('Is SEAS', { exact: false }) as HTMLSelectElement;
          fireEvent.change(isSEASSelector,
            { target: { value: IS_SEAS.N } });
          await wait(() => {}, { timeout: 1000 }); // fdo
          const submitButton = renderResult.getByText('Submit');
          fireEvent.click(submitButton);
          await waitForElementToBeRemoved(() => renderResult.queryByText('Note: * denotes a required field'));
          const modal = renderResult.queryByRole('dialog');
          strictEqual(modal, null);
        });
      });
      context('when the modal submit button is not clicked', function () {
        context('when the user attempts to exit the modal', function () {
          it('should show an unsaved changes warning', async function () {
            // Set new isSEAS category for course entry
            const isSEASSelector = await renderResult.findByLabelText('Is SEAS', { exact: false });
            fireEvent.change(isSEASSelector,
              { target: { value: IS_SEAS.N } });
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
