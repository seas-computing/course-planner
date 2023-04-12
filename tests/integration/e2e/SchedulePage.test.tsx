import { Test, TestingModule } from '@nestjs/testing';
import React from 'react';
import {
  stub, SinonStub,
} from 'sinon';
import {
  render,
  RenderResult,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import * as dummy from 'testData';
import { SessionModule } from 'nestjs-session';
import { MemoryRouter } from 'react-router-dom';
import App from 'client/components/App';
import request from 'client/api/request';
import { Repository, Not } from 'typeorm';
import { SemesterModule } from 'server/semester/semester.module';
import { Meeting } from 'server/meeting/meeting.entity';
import { dayEnumToString } from 'common/constants/day';
import { PGTime } from 'common/utils/PGTime';
import mockAdapter from '../../mocks/api/adapter';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import {
  AUTH_MODE, TERM_PATTERN,
} from '../../../src/common/constants';
import { PopulationModule } from '../../mocks/database/population/population.module';
import { CourseModule } from '../../../src/server/course/course.module';
import { BadRequestExceptionPipe } from '../../../src/server/utils/BadRequestExceptionPipe';
import { MetadataModule } from '../../../src/server/metadata/metadata.module';
import { FacultyModule } from '../../../src/server/faculty/faculty.module';
import { CourseInstanceModule } from '../../../src/server/courseInstance/courseInstance.module';
import { UserController } from '../../../src/server/user/user.controller';
import { LogModule } from '../../../src/server/log/log.module';

describe('End-to-end Schedule Page tests', function () {
  let testModule: TestingModule;
  let authStub: SinonStub;
  let meetingRepository: Repository<Meeting>;
  const currentAcademicYear = 2019;
  let renderResult: RenderResult;

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
        SemesterModule,
      ],
      controllers: [
        UserController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfig)
      .compile();
    meetingRepository = testModule.get(
      getRepositoryToken(Meeting)
    );
    const nestApp = await testModule
      .createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
    const api = nestApp.getHttpServer();
    request.defaults.adapter = mockAdapter(api);
    authStub.resolves(dummy.adminUser);
  });
  afterEach(async function () {
    return testModule.close();
  });
  describe('Rendering Schedule Information', function () {
    let parentMeetings: Meeting[];
    let childMeetings: Meeting[];
    beforeEach(async function () {
      parentMeetings = await meetingRepository.find({
        relations: ['courseInstance', 'courseInstance.course', 'courseInstance.course.area', 'room', 'room.building'],
        where: {
          courseInstance: {
            course: {
              termPattern: TERM_PATTERN.BOTH,
            },
          },
        },
      });
      const parentMeetingCourse = parentMeetings[0].courseInstance.course;
      childMeetings = await meetingRepository.find({
        relations: ['courseInstance', 'courseInstance.course', 'courseInstance.course.area', 'room', 'room.building'],
        where: {
          day: Not(parentMeetings[0].day),
          courseInstance: {
            course: {
              id: Not(parentMeetingCourse.id),
              area: {
                name: Not(parentMeetingCourse.area.name),
              },
            },
          },
        },
      });
      renderResult = render(
        <MemoryRouter initialEntries={['/course-admin']}>
          <App />
        </MemoryRouter>
      );
    });
    context('when a course is a child of another', function () {
      it('should display the meeting information of the parent course', async function () {
        const testMeeting = parentMeetings[0];
        const testParentCourse = testMeeting.courseInstance.course;
        const testChildCourse = childMeetings[0].courseInstance.course;
        await renderResult.findAllByText(testChildCourse.title);

        // Before setting the child course's "Same As" value to the parent,
        // we are filtering the Course Admin table by area, because there are
        // courses with the same title and differing catalog numbers. When
        // selecting the edit button, we want to make sure we are selecting
        // the intended one.
        const areaLabelText = 'The table will be filtered as selected in this area dropdown filter';
        const areaFilter = renderResult
          .getByLabelText(areaLabelText) as HTMLSelectElement;
        fireEvent.change(areaFilter,
          { target: { value: testChildCourse.area.name } });
        const catalogText = 'The table will be filtered as characters are typed in this course filter field';
        const catalogFilter = renderResult
          .getByLabelText(catalogText) as HTMLInputElement;
        fireEvent.change(catalogFilter,
          { target: { value: `${testChildCourse.prefix} ${testChildCourse.number}` } });
        // Open the child course modal to edit the "Same As" value
        const editButton = await renderResult
          .findByLabelText(`Edit course information for ${testChildCourse.title}`,
            { exact: false });
        fireEvent.click(editButton);
        await renderResult.findByRole('dialog');
        const sameAsSelect = renderResult.getByLabelText('Same As', { exact: false }) as HTMLSelectElement;
        fireEvent.change(
          sameAsSelect,
          { target: { value: testParentCourse.id } }
        );
        const submitButton = renderResult.getByText('Submit');
        fireEvent.click(submitButton);
        await waitForElementToBeRemoved(() => renderResult.getByRole('dialog'));

        // Navigate to the schedule page and wait for the table to render
        const scheduleTab = await renderResult.findByText('Schedule');
        fireEvent.click(scheduleTab);
        const parentCatalogNumber = `${testParentCourse.prefix} ${testParentCourse.number}`;
        await renderResult.findAllByText(parentCatalogNumber, { exact: false });

        // Make sure the child course displays the parent course's meeting information
        const parentCourseDay = dayEnumToString(testMeeting.day);
        const parentStartTime = PGTime.toDisplay(testMeeting.startTime);
        const parentEndTime = PGTime.toDisplay(testMeeting.endTime);
        const parentLocation = `${testMeeting.room.building.name} ${testMeeting.room.name}`;
        const parentMeetingInfo = `${parentCourseDay}, ${parentStartTime} to ${parentEndTime} in ${parentLocation}`;
        const childCourseInfo = `${testChildCourse.prefix} ${testChildCourse.number} on ${parentMeetingInfo}`;
        await renderResult.findByText(childCourseInfo);
      });
    });
  });
});
