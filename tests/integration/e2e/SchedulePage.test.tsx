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
import {
  Repository,
  Not,
  IsNull,
} from 'typeorm';
import { SemesterModule } from 'server/semester/semester.module';
import { Meeting } from 'server/meeting/meeting.entity';
import { dayEnumToString } from 'common/constants/day';
import { PGTime } from 'common/utils/PGTime';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { Semester } from 'server/semester/semester.entity';
import mockAdapter from '../../mocks/api/adapter';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import {
  AUTH_MODE, IS_SEAS, OFFERED, TERM,
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
  let ciRepository: Repository<CourseInstance>;
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
    ciRepository = testModule.get(
      getRepositoryToken(CourseInstance)
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
    let testCi: CourseInstance;
    let parentMeeting: Meeting;
    let parentMeetingSemester: Semester;
    let parentMeetingYear: string;
    let parentMeetingTerm: TERM;
    beforeEach(async function () {
      // Find a course instance that has a same as value. The same as course
      // will be used as the parent.
      testCi = await ciRepository.findOneOrFail({
        relations: ['course', 'course.sameAs', 'semester'],
        where: {
          offered: Not(OFFERED.RETIRED),
          course: {
            isSEAS: IS_SEAS.Y,
            sameAs: Not(IsNull()),
          },
        },
      });

      parentMeeting = await meetingRepository.findOneOrFail({
        relations: ['courseInstance', 'courseInstance.course', 'courseInstance.course.sameAs', 'courseInstance.semester', 'room', 'room.building'],
        where: {
          courseInstance: {
            offered: Not(OFFERED.RETIRED),
            course: testCi.course.sameAs.id,
          },
        },
      });

      parentMeetingSemester = parentMeeting.courseInstance.semester;
      parentMeetingYear = parentMeetingSemester.academicYear;
      parentMeetingTerm = parentMeetingSemester.term;

      renderResult = render(
        <MemoryRouter initialEntries={['/schedule']}>
          <App />
        </MemoryRouter>
      );
    });
    context('when a course is a child of another', function () {
      it('should display the meeting information of the parent course', async function () {
        await waitForElementToBeRemoved(() => renderResult.getByText('Fetching User Data'));
        await waitForElementToBeRemoved(() => renderResult.getByText('Fetching Course Schedule'));
        const semesterDropdown = renderResult.getByLabelText(/semester/i) as HTMLSelectElement;

        // Since the semester dropdown contains calendar years, the selection
        // must be changed depending on the semester.
        if (parentMeetingTerm === TERM.SPRING) {
          fireEvent.change(semesterDropdown, { target: { value: `${parentMeetingTerm} ${parentMeetingYear}` } });
        } else {
          fireEvent.change(semesterDropdown, { target: { value: `${parentMeetingTerm} ${parseInt(parentMeetingYear, 10) - 1}` } });
        }

        await waitForElementToBeRemoved(() => renderResult.getByText(
          'Fetching Course Schedule'
        ));
        await renderResult.findByText('7 PM');
        const testParentCourse = parentMeeting.courseInstance.course;
        const testChildCourse = testCi.course;
        const parentCatalogNumber = `${testParentCourse.prefix} ${testParentCourse.number}`;
        await renderResult.findAllByText(parentCatalogNumber, { exact: false });

        // Make sure the child course displays the parent course's meeting information
        const parentCourseDay = dayEnumToString(parentMeeting.day);
        const parentStartTime = PGTime.toDisplay(parentMeeting.startTime);
        const parentEndTime = PGTime.toDisplay(parentMeeting.endTime);
        const parentLocation = `${parentMeeting.room.building.name} ${parentMeeting.room.name}`;
        const parentMeetingInfo = `${parentCourseDay}, ${parentStartTime} to ${parentEndTime} in ${parentLocation}`;
        const childCourseInfo = `${testChildCourse.prefix} ${testChildCourse.number} on ${parentMeetingInfo}`;
        await renderResult.findByText(childCourseInfo, { exact: false });
      }).timeout(120000);
    });
  });
});
