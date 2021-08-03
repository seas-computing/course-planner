import { Test, TestingModule } from '@nestjs/testing';
import React from 'react';
import {
  stub,
} from 'sinon';
import {
  render,
  RenderResult,
  waitForElementToBeRemoved,
  fireEvent,
  within,
  getQueriesForElement,
} from '@testing-library/react';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import * as dummy from 'testData';
import { SessionModule } from 'nestjs-session';
import { MemoryRouter } from 'react-router-dom';
import App from 'client/components/App';
import request from 'client/api/request';
import { Repository } from 'typeorm';
import { strictEqual, deepStrictEqual } from 'assert';
import mockAdapter from '../../mocks/api/adapter';
import MockDB from '../../mocks/database/MockDB';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import { AUTH_MODE, DAY, TERM } from '../../../src/common/constants';
import { PopulationModule } from '../../mocks/database/population/population.module';
import { CourseModule } from '../../../src/server/course/course.module';
import { BadRequestExceptionPipe } from '../../../src/server/utils/BadRequestExceptionPipe';
import { MetadataModule } from '../../../src/server/metadata/metadata.module';
import { LocationModule } from '../../../src/server/location/location.module';
import { MeetingModule } from '../../../src/server/meeting/meeting.module';
import { FacultyModule } from '../../../src/server/faculty/faculty.module';
import { CourseInstanceModule } from '../../../src/server/courseInstance/courseInstance.module';
import { UserController } from '../../../src/server/user/user.controller';
import { Course } from '../../../src/server/course/course.entity';
import { Meeting } from '../../../src/server/meeting/meeting.entity';
import { dayEnumToString } from '../../../src/common/constants/day';
import { PGTime } from '../../../src/common/utils/PGTime';
import { CourseInstance } from '../../../src/server/courseInstance/courseinstance.entity';

describe('End-to-end Course Instance updating', function () {
  let db: MockDB;
  let testModule: TestingModule;
  let courseRepository: Repository<Course>;
  let meetingRepository: Repository<Meeting>;
  const currentAcademicYear = 2019;
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
    // Stub out the academicYear getter to lock us to a known year. Otherwise,
    // tests might fail in the future if our test data include that year.
    stub(fakeConfig, 'academicYear').get(() => currentAcademicYear);
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
        FacultyModule,
        CourseInstanceModule,
        MetadataModule,
        LocationModule,
        MeetingModule,
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
    meetingRepository = testModule.get(
      getRepositoryToken(Meeting)
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
  describe('Updating Meetings', function () {
    let renderResult: RenderResult;
    let courseToUpdate: Course;
    let instanceToUpdate: CourseInstance;
    let courseNumber: string;
    let roomName: string;
    let editButton: HTMLElement;
    beforeEach(async function () {
      const allCourses = await courseRepository.find(
        {
          relations: [
            'instances',
            'instances.semester',
            'instances.meetings',
            'instances.meetings.room',
            'instances.meetings.room.building',
            'instances.meetings.room.building.campus',
          ],
        }
      );
      courseToUpdate = allCourses.find(
        ({ instances }) => instances.some(
          ({ meetings, semester }) => (
            semester.term === TERM.FALL
            && semester.academicYear === (currentAcademicYear - 1).toString()
            && meetings?.length >= 2)
        )
      );
      instanceToUpdate = courseToUpdate.instances.find(({ semester }) => (
        semester.term === TERM.FALL
        && semester.academicYear === (currentAcademicYear - 1).toString()
      ));
      courseNumber = `${courseToUpdate.prefix} ${courseToUpdate.number}`;
      renderResult = render(
        <MemoryRouter initialEntries={['/courses']}>
          <App />
        </MemoryRouter>
      );
      await renderResult.findByText(courseNumber);
      const courseRows = await renderResult.findAllByRole('row');
      const courseRowToUpdate = courseRows.find((row) => {
        const rowHeader = within(row).queryByRole('rowheader');
        return rowHeader?.textContent === courseNumber;
      });
      ([editButton] = await within(courseRowToUpdate)
        .findAllByLabelText(
          `Edit meetings for ${courseNumber} in fall ${currentAcademicYear - 1}`,
          { exact: false }
        ));
      fireEvent.click(editButton);
      return renderResult.findByRole('dialog');
    });
    context('Adding a meeting', function () {
      beforeEach(async function () {
        const modal = renderResult.getByRole('dialog');
        // click "Add new Time"
        const addButton = await renderResult.findByText('Add New Time');
        fireEvent.click(addButton);
        // Set day
        const daySelector = await renderResult.findByLabelText('Meeting Day', { exact: false });
        fireEvent.change(daySelector, { target: { value: DAY.MON } });
        // set time
        const timeDropdown = await renderResult.findByLabelText('Timeslot Button');
        fireEvent.click(timeDropdown);
        const wantedTime = await renderResult.findByText('12:00 PM-1:00 PM');
        fireEvent.click(wantedTime);
        // choose room
        const showRoomsButton = await renderResult.findByText('Show Rooms');
        fireEvent.click(showRoomsButton);
        await waitForElementToBeRemoved(
          () => renderResult.getByText('Searching', { exact: false })
        );
        const roomRows = await within(modal).findAllByRole('row');
        const availableRoomRow = roomRows.find((row) => (getQueriesForElement(row).queryByRole('button')));
        const roomButton = within(availableRoomRow).getByRole('button');
        roomName = within(availableRoomRow).getByRole('rowheader').textContent;
        fireEvent.click(roomButton);
        // click close
        const closeButton = renderResult.getByText('Close');
        fireEvent.click(closeButton);
        // click save
        const saveButton = renderResult.getByText('Save');
        fireEvent.click(saveButton);
        return waitForElementToBeRemoved(() => within(modal).getByText('Saving Meetings'));
      });
      it('Should close the modal', function () {
        const modal = renderResult.queryByRole('dialog');
        strictEqual(modal, null);
      });
      it('Should show a success message', async function () {
        return renderResult.findByText('Course updated', { exact: false });
      });
      it('Should update the list of meetings', async function () {
        return within(editButton.parentElement)
          .findByText(roomName, { exact: false });
      });
    });
    context('Removing a meeting', function () {
      let testDeleteMeetingInfo: Meeting;
      beforeEach(async function () {
        const modal = renderResult.getByRole('dialog');
        // click "delete" for a meeting
        const deleteButtons = await renderResult.findAllByLabelText(/Delete Meeting/);
        const [testDeleteButton] = deleteButtons;
        const testDeleteMeetingId = testDeleteButton.id.replace('delete-button-', '');
        testDeleteMeetingInfo = await meetingRepository.findOne(
          testDeleteMeetingId,
          {
            relations: [
              'room',
              'room.building',
              'room.building.campus',
            ],
          }
        );
        fireEvent.click(testDeleteButton);
        // click save
        const saveButton = renderResult.getByText('Save');
        fireEvent.click(saveButton);
        return waitForElementToBeRemoved(() => within(modal).getByText('Saving Meetings'));
      });
      it('Should close the modal', function () {
        const modal = renderResult.queryByRole('dialog');
        strictEqual(modal, null);
      });
      it('Should show a success message', async function () {
        return renderResult.findByText('Course updated', { exact: false });
      });
      it('Should update the list of meetings', function () {
        // get the entries listed in the UI
        const meetingEntries = within(editButton.parentElement)
          .queryAllByRole('listitem');
        // make sure there's one missing
        strictEqual(
          meetingEntries.length,
          instanceToUpdate.meetings.length - 1
        );
        const origMeetings = [...instanceToUpdate.meetings];
        // Find the index of the meeting we deleted in the local list
        const deletedMeetingIndex = origMeetings.findIndex(
          ({ id }) => id === testDeleteMeetingInfo.id
        );
        // splice out the one we deleted
        const [deletedMeeting] = origMeetings.splice(deletedMeetingIndex, 1);
        // Map the original list to strings that match the html textContent
        const meetingToTextContent = ({
          day, startTime, endTime, room,
        }: Meeting) => (
          `${
            dayEnumToString(day)
          }${
            new PGTime(startTime).displayTime
          }-${
            new PGTime(endTime).displayTime
          }${room
            ? `${
              room.building.name
            } ${
              room.name
            }${
              room.building.campus.name
            }`
            : ''}`);
        const meetingNames = origMeetings.map(meetingToTextContent);
        const deletedMeetingName = meetingToTextContent(deletedMeeting);
        const uiMeetingNames = meetingEntries
          .map(({ textContent }) => textContent);
        // compare the textContent to confirm list is correct
        deepStrictEqual(uiMeetingNames, meetingNames);
        strictEqual(uiMeetingNames.includes(deletedMeetingName), false);
      });
    });
    context('Removing all meetings', function () {
      beforeEach(async function () {
        const modal = renderResult.getByRole('dialog');
        // click "delete" for every meeting
        const deleteButtons = await renderResult.findAllByLabelText(/Delete Meeting/);
        deleteButtons.forEach((testDeleteButton) => {
          fireEvent.click(testDeleteButton);
        });
        // click save
        const saveButton = renderResult.getByText('Save');
        fireEvent.click(saveButton);
        return waitForElementToBeRemoved(() => within(modal).getByText('Saving Meetings'));
      });
      it('Should close the modal', function () {
        const modal = renderResult.queryByRole('dialog');
        strictEqual(modal, null);
      });
      it('Should show a success message', async function () {
        return renderResult.findByText('Course updated', { exact: false });
      });
      it('Should update the list of meetings', function () {
        const meetingEntries = within(editButton.parentElement)
          .queryAllByRole('listitem');
        deepStrictEqual(meetingEntries, []);
      });
    });
    context('Modifying an existing meeting', function () {
      beforeEach(async function () {
        const modal = renderResult.getByRole('dialog');
        // click "Add new Time"
        const addButton = await renderResult.findByText('Add New Time');
        fireEvent.click(addButton);
        // Set day
        const daySelector = await renderResult.findByLabelText('Meeting Day', { exact: false });
        fireEvent.change(daySelector, { target: { value: DAY.MON } });
        // set time
        const timeDropdown = await renderResult.findByLabelText('Timeslot Button');
        fireEvent.click(timeDropdown);
        const wantedTime = await renderResult.findByText('5:00 PM-6:00 PM');
        fireEvent.click(wantedTime);
        // choose room
        const showRoomsButton = await renderResult.findByText('Show Rooms');
        fireEvent.click(showRoomsButton);
        await waitForElementToBeRemoved(
          () => renderResult.getByText('Searching', { exact: false })
        );
        const roomRows = await within(modal).findAllByRole('row');
        const availableRoomRow = roomRows.find((row) => (getQueriesForElement(row).queryByRole('button')));
        const roomButton = within(availableRoomRow).getByRole('button');
        roomName = within(availableRoomRow).getByRole('rowheader').textContent;
        fireEvent.click(roomButton);
        // click close
        const closeButton = renderResult.getByText('Close');
        fireEvent.click(closeButton);
        // click save
        const saveButton = renderResult.getByText('Save');
        fireEvent.click(saveButton);
        return waitForElementToBeRemoved(() => within(modal).getByText('Saving Meetings'));
      });
      it('Should close the modal', function () {
        const modal = renderResult.queryByRole('dialog');
        strictEqual(modal, null);
      });
      it('Should show a success message', async function () {
        return renderResult.findByText('Course updated', { exact: false });
      });
      it('Should update the list of meetings', async function () {
        return within(editButton.parentElement)
          .findByText('05:00 PM-06:00 PM');
      });
    });
  });
});
