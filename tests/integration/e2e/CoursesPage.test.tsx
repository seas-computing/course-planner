import { Test, TestingModule } from '@nestjs/testing';
import React, { ChangeEvent } from 'react';
import {
  stub, SinonStub,
} from 'sinon';
import {
  render,
  RenderResult,
  waitForElement,
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
import { Repository, Not, In } from 'typeorm';
import {
  strictEqual,
  deepStrictEqual,
  notStrictEqual,
  notDeepStrictEqual,
} from 'assert';
import { offeredEnumToString } from 'common/constants/offered';
import { SemesterModule } from 'server/semester/semester.module';
import { COURSE_TABLE_COLUMN, MANDATORY_COLUMNS } from 'common/constants';
import { tableFields } from 'client/components/pages/Courses/tableFields';
import { string } from 'testData';
import mockAdapter from '../../mocks/api/adapter';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import {
  AUTH_MODE,
  DAY,
  OFFERED,
  TERM,
} from '../../../src/common/constants';
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
import { Faculty } from '../../../src/server/faculty/faculty.entity';
import { FacultyCourseInstance } from '../../../src/server/courseInstance/facultycourseinstance.entity';
import { LogModule } from '../../../src/server/log/log.module';

describe('End-to-end Course Instance updating', function () {
  let testModule: TestingModule;
  let authStub: SinonStub;
  let courseRepository: Repository<Course>;
  let courseInstanceRepository: Repository<CourseInstance>;
  let meetingRepository: Repository<Meeting>;
  let facultyRepository: Repository<Faculty>;
  let fciRepository: Repository<FacultyCourseInstance>;
  const currentAcademicYear = 2019;
  const currentTerm = TERM.FALL;
  let renderResult: RenderResult;
  let courseNumber: string;

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
        LocationModule,
        MeetingModule,
        SemesterModule,
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
    facultyRepository = testModule.get(
      getRepositoryToken(Faculty)
    );
    fciRepository = testModule.get(
      getRepositoryToken(FacultyCourseInstance)
    );
    meetingRepository = testModule.get(
      getRepositoryToken(Meeting)
    );
    courseInstanceRepository = testModule.get(
      getRepositoryToken(CourseInstance)
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
  context('As a read-only user', function () {
    courseNumber = 'AM 205';
    beforeEach(function () {
      authStub.resolves(dummy.readOnlyUser);
    });

    it('Does not render meeting edit buttons', async function () {
      renderResult = render(
        <MemoryRouter initialEntries={['/courses']}>
          <App />
        </MemoryRouter>
      );
      // Wait for a course to appear on the pages
      await renderResult.findByText(courseNumber);
      // Within that row, look for the "edit button"
      const editFallMeetingButton = renderResult
        .queryByLabelText(
          `Edit meetings for ${courseNumber} in fall`,
          { exact: false }
        );
      // Assert that the edit button is null
      strictEqual(editFallMeetingButton, null);
      const editSpringMeetingButton = renderResult
        .queryByLabelText(
          `Edit meetings for ${courseNumber} in spring`,
          { exact: false }
        );
      strictEqual(editSpringMeetingButton, null);
    });
    it('Does not render instructor edit buttons', async function () {
      renderResult = render(
        <MemoryRouter initialEntries={['/courses']}>
          <App />
        </MemoryRouter>
      );
      await renderResult.findByText(courseNumber);
      const editFallInstructorButton = renderResult
        .queryByLabelText(
          `Edit instructors for ${courseNumber} in fall`,
          { exact: false }
        );
      strictEqual(editFallInstructorButton, null);
      const editSpringInstructorButton = renderResult
        .queryByLabelText(
          `Edit instructors for ${courseNumber} in spring`,
          { exact: false }
        );
      strictEqual(editSpringInstructorButton, null);
    });
    it('Does not render enrollment edit buttons', async function () {
      stub(global.window, 'sessionStorage').get(() => ({
        setItem: stub(),
        getItem: () => JSON.stringify([
          COURSE_TABLE_COLUMN.CATALOG_NUMBER,
          COURSE_TABLE_COLUMN.ENROLLMENT,
        ]),
        removeItem: stub(),
        length: 1,
      }));
      renderResult = render(
        <MemoryRouter initialEntries={['/courses']}>
          <App />
        </MemoryRouter>
      );
      await renderResult.findByText(courseNumber);

      const editFallInstructorButton = renderResult
        .queryByLabelText(
          `Edit enrollment for ${courseNumber} in fall`,
          { exact: false }
        );
      strictEqual(editFallInstructorButton, null);

      const editSpringInstructorButton = renderResult
        .queryByLabelText(
          `Edit enrollment for ${courseNumber} in spring`,
          { exact: false }
        );
      strictEqual(editSpringInstructorButton, null);
    });
  });
  context('As an admin user', function () {
    beforeEach(function () {
      authStub.resolves(dummy.adminUser);
    });
    describe('Updating Meetings', function () {
      let courseToUpdate: Course;
      let instanceToUpdate: CourseInstance;
      let roomName: string;
      let editButton: HTMLElement;
      beforeEach(async function () {
      // We're specifically updating the AM 205 course becuase there's a
      // built-in potential room conflict with AM 22A -- they both use the same
      // room at the same time on different days.
        courseNumber = 'AM 205';
        const [prefix, number] = courseNumber.split(' ');
        courseToUpdate = await courseRepository.findOneOrFail(
          {
            prefix,
            number,
          },
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
        instanceToUpdate = courseToUpdate.instances.find(({ semester }) => (
          semester.term === currentTerm
        && semester.academicYear === (currentAcademicYear - 1).toString()
        ));
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
        });
        context('when the modal save button is clicked', function () {
          it('Should close the modal', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            return waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
          });
          it('Should show a success message', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
            return renderResult.findByText('Course updated', { exact: false });
          });
          it('Should update the list of meetings', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
            return within(editButton.parentElement)
              .findByText(roomName, { exact: false });
          });
        });
        context('when the modal save button is not clicked', function () {
          context('when the user attempts to exit the modal', function () {
            it('should show an unsaved changes warning', async function () {
              const windowConfirmStub = stub(window, 'confirm');
              windowConfirmStub.returns(true);
              const cancelButton = await renderResult.findByText('Cancel');
              fireEvent.click(cancelButton);
              strictEqual(windowConfirmStub.callCount, 1);
            });
          });
        });
      });
      context('Removing a meeting', function () {
        let testDeleteMeetingInfo: Meeting;
        beforeEach(async function () {
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
        });
        context('when the modal save button is clicked', function () {
          it('Should close the modal', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            return waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
          });
          it('Should show a success message', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
            return renderResult.findByText('Course updated', { exact: false });
          });
          it('Should update the list of meetings', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
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
            const [deletedMeeting] = origMeetings
              .splice(deletedMeetingIndex, 1);
            // Map the original list to strings that match the html textContent
            const meetingToTextContent = ({
              day, startTime, endTime, room,
            }: Meeting) => (
              `${
                dayEnumToString(day)
              }${
                PGTime.toDisplay(startTime)
              } - ${
                PGTime.toDisplay(endTime)
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
        context('when the modal save button is not clicked', function () {
          context('when the user attempts to exit the modal', function () {
            it('should show an unsaved changes warning', async function () {
              const windowConfirmStub = stub(window, 'confirm');
              windowConfirmStub.returns(true);
              const cancelButton = await renderResult.findByText('Cancel');
              fireEvent.click(cancelButton);
              strictEqual(windowConfirmStub.callCount, 1);
            });
          });
        });
      });
      context('Removing all meetings', function () {
        beforeEach(async function () {
        // click "delete" for every meeting
          const deleteButtons = await renderResult.findAllByLabelText(/Delete Meeting/);
          deleteButtons.forEach((testDeleteButton) => {
            fireEvent.click(testDeleteButton);
          });
        });
        context('when the modal save button is clicked', function () {
          it('Should close the modal', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
            const modal = renderResult.queryByRole('dialog');
            strictEqual(modal, null);
          });
          it('Should show a success message', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
            return renderResult.findByText('Course updated', { exact: false });
          });
          it('Should update the list of meetings', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
            const meetingEntries = within(editButton.parentElement)
              .queryAllByRole('listitem');
            deepStrictEqual(meetingEntries, []);
          });
        });
        context('when the modal save button is not clicked', function () {
          context('when the user attempts to exit the modal', function () {
            it('should show an unsaved changes warning', async function () {
              const windowConfirmStub = stub(window, 'confirm');
              windowConfirmStub.returns(true);
              const cancelButton = await renderResult.findByText('Cancel');
              fireEvent.click(cancelButton);
              strictEqual(windowConfirmStub.callCount, 1);
            });
          });
        });
      });
      context('Modifying an existing meeting', function () {
        context('with a valid room/time combination', function () {
          beforeEach(async function () {
          // click "Edit Meeting 1"
            const meetingEditButton = await renderResult.findByLabelText(/Edit Meeting 1/);
            fireEvent.click(meetingEditButton);
            // Set day
            const daySelector = await renderResult.findByLabelText('Meeting Day', { exact: false });
            // It's hard-coded that AM 205 is on TUE/THU 10:30 - 11:45 and AM 22A
            // is MON/WED/FRI 10:30 - 11:45 in the same room, so we can change to
            // AM 205 to MON 12:00 - 13:30.
            fireEvent.change(daySelector, {
              target: {
                value: DAY.MON,
              },
            });
            const startTimeField = await renderResult
              .findByLabelText('Meeting Start Time', { exact: false });
            fireEvent.change(startTimeField, {
              target: {
                value: '12:00:00',
              },
            });
            const endTimeField = await renderResult
              .findByLabelText('Meeting End Time', { exact: false });
            fireEvent.change(endTimeField, {
              target: {
                value: '13:30:00',
              },
            });
            const closeButton = renderResult.getByText('Close');
            fireEvent.click(closeButton);
          });
          context('when the modal save button is clicked', function () {
            it('Should close the modal', async function () {
            // click save
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
              const modal = renderResult.queryByRole('dialog');
              strictEqual(modal, null);
            });
            it('Should show a success message', async function () {
            // click save
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
              return renderResult.findByText('Course updated', { exact: false });
            });
            it('Should update the list of meetings', async function () {
            // click save
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
              const dayField = await within(editButton.parentElement)
                .findByText('Monday');
              return within(dayField.parentElement)
                .findByText('12:00 PM - 1:30 PM');
            });
          });
          context('when the modal save button is not clicked', function () {
            context('when the user attempts to exit the modal', function () {
              it('should show an unsaved changes warning', async function () {
                const windowConfirmStub = stub(window, 'confirm');
                windowConfirmStub.returns(true);
                const cancelButton = await renderResult.findByText('Cancel');
                fireEvent.click(cancelButton);
                strictEqual(windowConfirmStub.callCount, 1);
              });
            });
          });
        });
        context('with an invalid room/time combination', function () {
          beforeEach(async function () {
          // click "Edit Meeting 1"
            const meetingEditButton = await renderResult.findByLabelText(/Edit Meeting 1/);
            fireEvent.click(meetingEditButton);
            const daySelector = await renderResult.findByLabelText('Meeting Day', { exact: false });
            // It's hard-coded that AM 205 is on TUE/THU 10:30 - 11:45 and AM 22A
            // is MON/WED/FRI 10:30 - 11:45 in the same room, so if change AM 205
            // to MON wihout adjusting the time, we should get an error
            fireEvent.change(daySelector, {
              target: {
                value: DAY.MON,
              },
            });
            // Set day
            const closeButton = renderResult.getByText('Close');
            fireEvent.click(closeButton);
          });
          context('when the modal save button is clicked', function () {
            it('Should not close the modal', async function () {
            // click save
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
              const modal = renderResult.queryByRole('dialog');
              notStrictEqual(modal, null);
            });
            it('Should show an error message', async function () {
            // click save
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
              const modal = renderResult.getByRole('dialog');
              const modalError = await within(modal).findByRole('alert');
              strictEqual(
                modalError.textContent,
                'Maxwell Dworkin 220 is not available on Monday between 10:30 AM - 11:45 AM. CONFLICTS WITH: AM 22A'
              );
            });
            it('Should clear the error when any meeting detail changes', async function () {
            // click save
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
              const modal = renderResult.getByRole('dialog');
              const meetingEditButton = await within(modal).findByLabelText(/Edit Meeting 1/);
              fireEvent.click(meetingEditButton);
              const timeDropdown = await renderResult.findByLabelText('Timeslot Button');
              fireEvent.click(timeDropdown);
              const wantedTime = await renderResult.findByText('12:00 PM-1:00 PM');
              fireEvent.click(wantedTime);
              const closeButton = renderResult.getByText('Close');
              fireEvent.click(closeButton);
              const errorMessage = within(modal).queryByRole('alert');
              strictEqual(errorMessage, null);
            });
            it('Should clear the error when closing/reopening modal', async function () {
            // click save
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
              const cancelButton = await renderResult.findByText('Cancel');
              stub(window, 'confirm').returns(true);
              fireEvent.click(cancelButton);
              const updatedEditButton = await renderResult.findByRole(
                'button',
                {
                  name: `Edit meetings for ${courseNumber} in fall ${currentAcademicYear - 1}`,
                }
              );
              fireEvent.click(updatedEditButton);
              const modal = await renderResult.findByRole('dialog');
              strictEqual(
                within(modal).queryByRole('alert'),
                null
              );
            });
          });
          context('when the modal save button is not clicked', function () {
            context('when the user attempts to exit the modal', function () {
              it('should show an unsaved changes warning', async function () {
                const windowConfirmStub = stub(window, 'confirm');
                windowConfirmStub.returns(true);
                const cancelButton = await renderResult.findByText('Cancel');
                fireEvent.click(cancelButton);
                strictEqual(windowConfirmStub.callCount, 1);
              });
            });
          });
        });
      });
      context('Making no changes to meetings', function () {
        context('when the modal save button is clicked', function () {
          it('Should close the modal', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
            const modal = renderResult.queryByRole('dialog');
            strictEqual(modal, null);
          });
          it('Should show a success message', async function () {
          // click save
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            await waitForElementToBeRemoved(() => renderResult.queryByText('Saving Meetings'));
            return renderResult.findByText('Course updated', { exact: false });
          });
        });
        context('when the modal save button is not clicked', function () {
          context('when the user attempts to exit the modal', function () {
            it('should not show an unsaved changes warning', async function () {
              const windowConfirmStub = stub(window, 'confirm');
              const cancelButton = await renderResult.findByText('Cancel');
              fireEvent.click(cancelButton);
              strictEqual(windowConfirmStub.callCount, 0);
            });
          });
        });
      });
    });
    describe('Updating Instructors', function () {
      let courseToUpdate: Course;
      let instanceToUpdate: CourseInstance;
      let editButton: HTMLElement;
      const emptyTerm = TERM.SPRING;
      beforeEach(async function () {
      // We're specifically updating the CS 109A course becuase there are
      // multiple instructors in the Fall instances, and none in spring
        courseNumber = 'CS 109A';
        const [prefix, number] = courseNumber.split(' ');
        courseToUpdate = await courseRepository.findOneOrFail(
          {
            prefix,
            number,
          },
          {
            relations: [
              'instances',
              'instances.semester',
              'instances.facultyCourseInstances',
              'instances.facultyCourseInstances.faculty',
            ],
          }
        );
      });
      context('When an instance already has instructors assigned', function () {
        let assignedInstructors: Faculty[];
        beforeEach(async function () {
          instanceToUpdate = courseToUpdate.instances.find(({ semester }) => (
            semester.term === currentTerm
        && semester.academicYear === (currentAcademicYear - 1).toString()
          ));
          assignedInstructors = instanceToUpdate
            .facultyCourseInstances
            .map(({ faculty }) => (faculty));
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
              `Edit instructors for ${courseNumber}, ${currentTerm.toLowerCase()} ${currentAcademicYear - 1}`,
              { exact: false }
            ));
          fireEvent.click(editButton);
          return renderResult.findByRole('dialog');
        });
        context('Adding instructors', function () {
          let unassignedInstructors: Faculty[];
          beforeEach(async function () {
            unassignedInstructors = await facultyRepository.find(
              {
                where: {
                  id: Not(In(assignedInstructors.map(({ id }) => id))),
                },
              }
            );
          });
          context('just one instructor', function () {
            let instructorToAddDisplayName: string;
            let instructorToAdd: Faculty;
            beforeEach(async function () {
              instructorToAdd = unassignedInstructors[0];
              instructorToAddDisplayName = `${instructorToAdd.lastName}, ${instructorToAdd.firstName}`;
              const inModal = within(renderResult.getByRole('dialog'));
              const addInstructorInput = inModal.getByRole('textbox');
              fireEvent.change(
                addInstructorInput,
                {
                  target: {
                    value: instructorToAdd.lastName,
                  },
                }
              );
              const instructorAddButton = await inModal
                .findByText(instructorToAddDisplayName);
              fireEvent.click(instructorAddButton);
              return within(inModal.getByRole('list'))
                .findByText(instructorToAddDisplayName);
            });
            context('clicking Save', function () {
              it('should Close the modal and add the name to the list', async function () {
                fireEvent.click(renderResult.getByText('Save'));
                await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
                // Make sure modal closed
                const modal = renderResult.queryByRole('dialog');
                strictEqual(modal, null, 'Modal did not close');
                // Make sure message appeared
                const successMessage = await renderResult.findByText('Course updated', { exact: false });
                notStrictEqual(successMessage, null, 'Success message did not appear');
                // Make sure name appears in the list
                const updatedName = await within(editButton.parentElement)
                  .findByText(instructorToAddDisplayName);
                notStrictEqual(updatedName, null, 'Instructor name is not in list');
                // Make sure the list grew longer
                const listCount = within(editButton.parentElement).getAllByRole('listitem').length;
                strictEqual(listCount, assignedInstructors.length + 1, 'Length of instructor list did not change');
                // Make sure data has persisted to database
                const updatedInstructors = await fciRepository.find(
                  {
                    where: { courseInstance: instanceToUpdate.id },
                    relations: [
                      'faculty',
                    ],
                    order: { order: 'ASC' },
                  }
                );
                const newInstructorEntry = updatedInstructors.find(
                  ({ faculty }) => (faculty.id === instructorToAdd.id)
                );
                // Check that the instructor order has been updated in the database
                strictEqual(newInstructorEntry.order, assignedInstructors.length, 'Order in database is wrong');
                strictEqual(
                  `${newInstructorEntry.faculty.lastName}, ${newInstructorEntry.faculty.firstName}`,
                  instructorToAddDisplayName,
                  'Instructor name is wrong'
                );
              });
            });
            context('clicking Cancel', function () {
              let confirmStub: SinonStub;
              beforeEach(function () {
                confirmStub = stub(window, 'confirm');
              });
              context('Confirm returns true', function () {
                beforeEach(function () {
                  confirmStub.returns(true);
                });
                it('Should close the modal and not update the list', function () {
                  fireEvent.click(renderResult.getByText('Cancel'));
                  const modal = renderResult.queryByRole('dialog');
                  strictEqual(modal, null);
                  const instructorCell = within(editButton.parentElement);
                  const namesInCell = instructorCell.getAllByRole('listitem')
                    .map(({ textContent }) => textContent);
                  const originalNames = assignedInstructors
                    .map(({ firstName, lastName }) => (
                      `${lastName}, ${firstName}`
                    ));
                  deepStrictEqual(namesInCell, originalNames);
                });
              });
              context('Confirm returns false', function () {
                beforeEach(function () {
                  confirmStub.returns(false);
                });
                it('Should leave the modal open and preserve changes', function () {
                  fireEvent.click(renderResult.getByText('Cancel'));
                  const modal = renderResult.queryByRole('dialog');
                  notStrictEqual(modal, null);
                  const instructorList = within(modal).getAllByRole('listitem');
                  const namesInList = instructorList
                    .map(({ textContent }) => textContent);
                  const pendingNames = [
                    ...assignedInstructors
                      .map(({ firstName, lastName }) => (
                        `${lastName}, ${firstName}`
                      )),
                    instructorToAddDisplayName];
                  deepStrictEqual(namesInList, pendingNames);
                });
              });
            });
          });
        });
        context('Removing instructors', function () {
          context('just one instructor', function () {
            let instructorToRemove: Faculty;
            let instructorToRemoveDisplayName: string;
            beforeEach(async function () {
              instructorToRemove = assignedInstructors[0];
              instructorToRemoveDisplayName = `${instructorToRemove.lastName}, ${instructorToRemove.firstName}`;
              const inModal = within(renderResult.getByRole('dialog'));
              const removeButton = inModal.getByLabelText(
                `remove ${instructorToRemoveDisplayName}`,
                { exact: false }
              );
              fireEvent.click(removeButton);
              // Need to wait for the "all instructor" request to finish first
              return inModal.findByPlaceholderText('Add new instructor');
            });
            context('clicking Save', function () {
              it('Should Close the modal and remove the name from the list', async function () {
                fireEvent.click(renderResult.getByText('Save'));
                await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
                // Make sure message appeared
                const successMessage = await renderResult.findByText('Course updated', { exact: false });
                notStrictEqual(successMessage, null, 'Success message did not appear');
                // Make sure name does not appear in the list
                const updatedName = within(editButton.parentElement)
                  .queryByText(instructorToRemoveDisplayName);
                strictEqual(updatedName, null, 'Instructor name is still in list');
                // Make sure the list shrank
                const listCount = within(editButton.parentElement).getAllByRole('listitem').length;
                strictEqual(listCount, assignedInstructors.length - 1, 'Length of instructor list did not change');
                // Make sure data has persisted to database
                const updatedInstructors = await fciRepository.find(
                  {
                    where: { courseInstance: instanceToUpdate.id },
                    relations: [
                      'faculty',
                    ],
                    order: { order: 'ASC' },
                  }
                );
                const removedInstructorIndex = updatedInstructors.findIndex(
                  ({ faculty }) => (faculty.id === instructorToRemove.id)
                );
                // Check that the instructor does not appear in the database list
                strictEqual(
                  removedInstructorIndex, -1, 'Instructor is still in database'
                );
              });
            });
            context('clicking Cancel', function () {
              let confirmStub: SinonStub;
              beforeEach(function () {
                confirmStub = stub(window, 'confirm');
              });
              context('Confirm returns true', function () {
                beforeEach(function () {
                  confirmStub.returns(true);
                });
                it('Should close the modal and not update the list', function () {
                  fireEvent.click(renderResult.getByText('Cancel'));
                  const modal = renderResult.queryByRole('dialog');
                  strictEqual(modal, null);
                  const instructorCell = within(editButton.parentElement);
                  const namesInCell = instructorCell.getAllByRole('listitem')
                    .map(({ textContent }) => textContent);
                  const originalNames = assignedInstructors
                    .map(({ firstName, lastName }) => (
                      `${lastName}, ${firstName}`
                    ));
                  deepStrictEqual(namesInCell, originalNames);
                });
              });
              context('Confirm returns false', function () {
                beforeEach(function () {
                  confirmStub.returns(false);
                });
                it('Should leave the modal open and preserve changes', function () {
                  fireEvent.click(renderResult.getByText('Cancel'));
                  const modal = renderResult.queryByRole('dialog');
                  notStrictEqual(modal, null);
                  const instructorList = within(modal).getAllByRole('listitem');
                  const namesInList = instructorList
                    .map(({ textContent }) => textContent)
                    .filter((text) => !text.startsWith('No results'));
                  const pendingNames = assignedInstructors
                    .filter(({ id }) => id !== instructorToRemove.id)
                    .map(({ firstName, lastName }) => (
                      `${lastName}, ${firstName}`
                    ));
                  deepStrictEqual(namesInList, pendingNames);
                });
              });
            });
          });
          context('all instructors', function () {
            beforeEach(function () {
              const inModal = within(renderResult.getByRole('dialog'));
              const removeButtons = inModal.getAllByLabelText('remove', { exact: false });
              removeButtons.forEach((button) => {
                fireEvent.click(button);
              });
              // Need to wait for the "all instructor" request to finish first
              return inModal.findByPlaceholderText('Add new instructor');
            });
            context('clicking Save', function () {
              it('should Close the modal and remove all names from the list', async function () {
                fireEvent.click(renderResult.getByText('Save'));
                await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
                // Make sure message appeared
                const successMessage = await renderResult.findByText('Course updated', { exact: false });
                notStrictEqual(successMessage, null, 'Success message did not appear');
                // Make sure instructor list is empty
                const updatedNameList = within(editButton.parentElement)
                  .queryAllByRole('listitem');
                deepStrictEqual(updatedNameList, [], 'Instructor list is not empty');
                // Make sure data has persisted to database
                const updatedInstructors = await fciRepository.find(
                  {
                    where: { courseInstance: instanceToUpdate.id },
                    relations: [
                      'faculty',
                    ],
                    order: { order: 'ASC' },
                  }
                );
                deepStrictEqual(updatedInstructors, [], 'Instructors still assigned in database');
              });
            });
            context('clicking Cancel', function () {
              let confirmStub: SinonStub;
              beforeEach(function () {
                confirmStub = stub(window, 'confirm');
              });
              context('Confirm returns true', function () {
                beforeEach(function () {
                  confirmStub.returns(true);
                });
                it('Should close the modal and not update the list', function () {
                  fireEvent.click(renderResult.getByText('Cancel'));
                  const modal = renderResult.queryByRole('dialog');
                  strictEqual(modal, null);
                  const instructorCell = within(editButton.parentElement);
                  const namesInCell = instructorCell.getAllByRole('listitem')
                    .map(({ textContent }) => textContent);
                  const originalNames = assignedInstructors
                    .map(({ firstName, lastName }) => (
                      `${lastName}, ${firstName}`
                    ));
                  deepStrictEqual(namesInCell, originalNames);
                });
              });
              context('Confirm returns false', function () {
                beforeEach(function () {
                  confirmStub.returns(false);
                });
                it('Should leave the modal open and preserve changes', function () {
                  fireEvent.click(renderResult.getByText('Cancel'));
                  const modal = renderResult.queryByRole('dialog');
                  notStrictEqual(modal, null);
                  const instructorList = within(modal).queryAllByRole('listitem');
                  const namesInList = instructorList
                    .map(({ textContent }) => textContent)
                    .filter((text) => !text.startsWith('No results'));
                  deepStrictEqual(namesInList, []);
                });
              });
            });
          });
        });
        context('Rearranging instructors', function () {
          let instructorToMove: Faculty;
          let instructorToMoveDisplayName: string;
          beforeEach(async function () {
            instructorToMove = assignedInstructors[0];
            instructorToMoveDisplayName = `${instructorToMove.lastName}, ${instructorToMove.firstName}`;
            const inModal = within(renderResult.getByRole('dialog'));
            const moveButton = inModal.getByLabelText(
              `move ${instructorToMoveDisplayName} down`,
              { exact: false }
            );
            fireEvent.click(moveButton);
            // Need to wait for the "all instructor" request to finish first
            return inModal.findByPlaceholderText('Add new instructor');
          });
          context('clicking Save', function () {
            it('Should Close the modal and reorder the names in the list', async function () {
              fireEvent.click(renderResult.getByText('Save'));
              await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
              // Make sure message appeared
              const successMessage = await renderResult.findByText('Course updated', { exact: false });
              notStrictEqual(successMessage, null, 'Success message did not appear');
              // Make sure list is in the new order
              const updatedList = within(editButton.parentElement).getAllByRole('listitem');
              const [
                assignedOne,
                assignedTwo,
                assignedThree,
              ] = assignedInstructors;
              const newOrder = [
                assignedTwo,
                assignedOne,
                assignedThree,
              ].map(({ firstName, lastName }) => `${lastName}, ${firstName}`);
              const updatedNames = updatedList.map(
                ({ textContent }) => textContent
              );
              deepStrictEqual(updatedNames, newOrder);
              // Make sure data has persisted to database
              const updatedInstructors = await fciRepository.find(
                {
                  where: { courseInstance: instanceToUpdate.id },
                  relations: [
                    'faculty',
                  ],
                  order: { order: 'ASC' },
                }
              );
              const dbOrder = updatedInstructors
                .map(({ faculty: { firstName, lastName } }) => `${lastName}, ${firstName}`);
              deepStrictEqual(
                dbOrder, newOrder, 'Instructor order is wrong in database'
              );
            });
          });
          context('clicking Cancel', function () {
            let confirmStub: SinonStub;
            beforeEach(function () {
              confirmStub = stub(window, 'confirm');
            });
            context('Confirm returns true', function () {
              beforeEach(function () {
                confirmStub.returns(true);
              });
              it('Should close the modal and not update the list', function () {
                fireEvent.click(renderResult.getByText('Cancel'));
                const modal = renderResult.queryByRole('dialog');
                strictEqual(modal, null);
                const instructorCell = within(editButton.parentElement);
                const namesInCell = instructorCell.getAllByRole('listitem')
                  .map(({ textContent }) => textContent);
                const originalNames = assignedInstructors
                  .map(({ firstName, lastName }) => (
                    `${lastName}, ${firstName}`
                  ));
                deepStrictEqual(namesInCell, originalNames);
              });
            });
            context('Confirm returns false', function () {
              beforeEach(function () {
                confirmStub.returns(false);
              });
              it('Should leave the modal open and preserve changes', function () {
                fireEvent.click(renderResult.getByText('Cancel'));
                const modal = renderResult.queryByRole('dialog');
                notStrictEqual(modal, null);
                const instructorList = within(modal).getAllByRole('listitem');
                const namesInList = instructorList
                  .map(({ textContent }) => textContent)
                  .filter((text) => !text.startsWith('No results'));
                const [
                  assignedOne,
                  assignedTwo,
                  assignedThree,
                ] = assignedInstructors;
                const pendingNames = [
                  assignedTwo,
                  assignedOne,
                  assignedThree,
                ].map(({ firstName, lastName }) => `${lastName}, ${firstName}`);
                deepStrictEqual(namesInList, pendingNames);
              });
            });
          });
        });
      });
      context('When an instance has no one assigned', function () {
        beforeEach(async function () {
          instanceToUpdate = courseToUpdate.instances.find(({ semester }) => (
            semester.term === emptyTerm
        && semester.academicYear === currentAcademicYear.toString()
          ));
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
              `Edit instructors for ${courseNumber}, ${emptyTerm.toLowerCase()} ${currentAcademicYear}`,
              { exact: false }
            ));
          fireEvent.click(editButton);
          return renderResult.findByRole('dialog');
        });
        context('Adding instructors', function () {
          let unassignedInstructors: Faculty[];
          beforeEach(async function () {
            unassignedInstructors = await facultyRepository.find();
          });
          context('just one instructor', function () {
            let instructorToAddDisplayName: string;
            let instructorToAdd: Faculty;
            beforeEach(async function () {
              instructorToAdd = unassignedInstructors[0];
              instructorToAddDisplayName = `${instructorToAdd.lastName}, ${instructorToAdd.firstName}`;
              const inModal = within(renderResult.getByRole('dialog'));
              const addInstructorInput = inModal.getByRole('textbox');
              fireEvent.change(
                addInstructorInput,
                {
                  target: {
                    value: instructorToAdd.lastName,
                  },
                }
              );
              const instructorAddButton = await inModal
                .findByText(instructorToAddDisplayName);
              fireEvent.click(instructorAddButton);
              return within(inModal.getByRole('list'))
                .findByText(instructorToAddDisplayName);
            });
            context('clicking Save', function () {
              it('should Close the modal and add the name the list', async function () {
                fireEvent.click(renderResult.getByText('Save'));
                await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
                // Make sure modal closed
                const modal = renderResult.queryByRole('dialog');
                strictEqual(modal, null, 'Modal did not close');
                // Make sure message appeared
                const successMessage = await renderResult.findByText('Course updated', { exact: false });
                notStrictEqual(successMessage, null, 'Success message did not appear');
                // Make sure name appears in the list
                const updatedName = await within(editButton.parentElement)
                  .findByText(instructorToAddDisplayName);
                notStrictEqual(updatedName, null, 'Instructor name is not in list');
                // Make sure the list grew longer
                const listCount = within(editButton.parentElement).getAllByRole('listitem').length;
                strictEqual(listCount, 1, 'Length of instructor list did not change');
                // Make sure data has persisted to database
                const updatedInstructors = await fciRepository.find(
                  {
                    where: { courseInstance: instanceToUpdate.id },
                    relations: [
                      'faculty',
                    ],
                    order: { order: 'ASC' },
                  }
                );
                const newInstructorEntry = updatedInstructors.find(
                  ({ faculty }) => (faculty.id === instructorToAdd.id)
                );
                // Check that the instructor has the correct order field
                strictEqual(newInstructorEntry.order, 0, 'Order in database is wrong');
                strictEqual(
                  `${newInstructorEntry.faculty.lastName}, ${newInstructorEntry.faculty.firstName}`,
                  instructorToAddDisplayName,
                  'Instructor name is wrong'
                );
              });
            });
            context('clicking Cancel', function () {
              let confirmStub: SinonStub;
              beforeEach(function () {
                confirmStub = stub(window, 'confirm');
              });
              context('Confirm returns true', function () {
                beforeEach(function () {
                  confirmStub.returns(true);
                });
                it('Should close the modal and not update the list', function () {
                  fireEvent.click(renderResult.getByText('Cancel'));
                  const modal = renderResult.queryByRole('dialog');
                  strictEqual(modal, null);
                  const instructorCell = within(editButton.parentElement);
                  const namesInCell = instructorCell.queryAllByRole('listitem');
                  deepStrictEqual(namesInCell, []);
                });
              });
              context('Confirm returns false', function () {
                beforeEach(function () {
                  confirmStub.returns(false);
                });
                it('Should leave the modal open and preserve changes', function () {
                  fireEvent.click(renderResult.getByText('Cancel'));
                  const modal = renderResult.queryByRole('dialog');
                  notStrictEqual(modal, null);
                  const instructorList = within(modal).getAllByRole('listitem');
                  const namesInList = instructorList
                    .map(({ textContent }) => textContent);
                  const pendingNames = [
                    instructorToAddDisplayName];

                  deepStrictEqual(namesInList, pendingNames);
                });
              });
            });
          });
        });
      });
    });
    describe('Updating Offered Values', function () {
      let editSpringOfferedButton: HTMLElement;
      let editFallOfferedButton: HTMLElement;
      beforeEach(async function () {
        const [prefix, number] = courseNumber.split(' ');
        await courseRepository.findOneOrFail(
          {
            prefix,
            number,
          },
          {
            relations: [
              'instances',
              'instances.semester',
            ],
          }
        );
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
        ([editFallOfferedButton] = await within(courseRowToUpdate)
          .findAllByLabelText(
            `Edit offered value for ${courseNumber}, ${currentTerm} ${currentAcademicYear - 1}`,
            { exact: false }
          ));
        fireEvent.click(editFallOfferedButton);
        return renderResult.findByRole('dialog');
      });
      context('Editing an offered value', function () {
        context('to a valid value other than "Retired"', function () {
          const newOfferedValue = OFFERED.N;
          beforeEach(async function () {
            const offeredSelector = await renderResult.findByLabelText('Edit Offered Value Dropdown', { exact: false });
            fireEvent.change(offeredSelector, {
              target: {
                value: newOfferedValue,
              },
            });
          });
          context('when the modal save button is clicked', function () {
            it('should close the modal', async function () {
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
              const modal = renderResult.queryByRole('dialog');
              strictEqual(modal, null);
            });
            it('should show a success message', async function () {
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByText('Saving'));
              return renderResult.findByText('Course updated', { exact: false });
            });
            it('should update the offered value', async function () {
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByText('Saving'));
              return within(editFallOfferedButton.parentElement)
                .findByText(offeredEnumToString(newOfferedValue));
            });
          });
          context('when the modal save button is not clicked', function () {
            context('when the user attempts to exit the modal', function () {
              it('should not show an unsaved changes warning', async function () {
                const windowConfirmStub = stub(window, 'confirm');
                windowConfirmStub.returns(true);
                const cancelButton = await renderResult.findByText('Cancel');
                fireEvent.click(cancelButton);
                strictEqual(windowConfirmStub.callCount, 0);
              });
            });
          });
        });
        context('to "Retired"', function () {
          context('for the current course instance', function () {
            beforeEach(async function () {
              const offeredSelector = await renderResult.findByLabelText('Edit Offered Value Dropdown', { exact: false });
              fireEvent.change(offeredSelector, {
                target: {
                  value: OFFERED.RETIRED,
                },
              });
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
              // Click the Show Retired button to reveal newly retired course
              const retiredCheckbox = renderResult.getByLabelText('Show Retired', { exact: false }) as HTMLInputElement;
              fireEvent.click(retiredCheckbox);
              await renderResult.findByText(courseNumber);
            });
            context('when the modal save button is clicked', function () {
              it('should close the modal', function () {
                const modal = renderResult.queryByRole('dialog');
                strictEqual(modal, null);
              });
              it('should show a success message', async function () {
                return renderResult.findByText('Course updated', { exact: false });
              });
              it('should update the offered value of the saved instance', async function () {
                const courseRows = await renderResult.findAllByRole('row');
                const courseRowToUpdate = courseRows.find((row) => {
                  const rowHeader = within(row).queryByRole('rowheader');
                  return rowHeader?.textContent === courseNumber;
                });
                ([editFallOfferedButton] = await within(courseRowToUpdate)
                  .findAllByLabelText(
                    `Edit offered value for ${courseNumber}, ${currentTerm} ${currentAcademicYear - 1}`,
                    { exact: false }
                  ));
                return within(editFallOfferedButton.parentElement)
                  .findByText(offeredEnumToString(OFFERED.RETIRED));
              });
              it('should update the offered value of future course instances to be OFFERED.RETIRED', async function () {
                // Check the spring semester of the same year
                const courseRows = await renderResult.findAllByRole('row');
                const courseRowToUpdate = courseRows.find((row) => {
                  const rowHeader = within(row).queryByRole('rowheader');
                  return rowHeader?.textContent === courseNumber;
                });
                ([editSpringOfferedButton] = await within(courseRowToUpdate)
                  .findAllByLabelText(
                    `Edit offered value for ${courseNumber}, ${TERM.SPRING} ${currentAcademicYear}`,
                    { exact: false }
                  ));
                notStrictEqual(
                  await within(editSpringOfferedButton.parentElement)
                    .findByText(offeredEnumToString(OFFERED.RETIRED)),
                  null,
                  'Spring instance of the same academic year did not update to "Retired'
                );
                // Checks the fall and spring semester offered values of the next academic year
                const academicYearSelector = await renderResult.findByLabelText('Academic Year', { exact: false }) as HTMLSelectElement;
                fireEvent.change(academicYearSelector, {
                  target: {
                    value: currentAcademicYear + 1,
                  },
                });
                await renderResult.findByText(courseNumber);
                const futureCourseRows = await renderResult.findAllByRole('row');
                const futureCourseRowToUpdate = futureCourseRows.find((row) => {
                  const rowHeader = within(row).queryByRole('rowheader');
                  return rowHeader?.textContent === courseNumber;
                });
                ([editFallOfferedButton] = await within(futureCourseRowToUpdate)
                  .findAllByLabelText(
                    `Edit offered value for ${courseNumber}, ${TERM.FALL} ${currentAcademicYear}`,
                    { exact: false }
                  ));
                ([editSpringOfferedButton] = await within(
                  futureCourseRowToUpdate
                )
                  .findAllByLabelText(
                    `Edit offered value for ${courseNumber}, ${TERM.SPRING} ${currentAcademicYear + 1}`,
                    { exact: false }
                  ));
                notStrictEqual(
                  await within(editFallOfferedButton.parentElement)
                    .findByText(offeredEnumToString(OFFERED.RETIRED)),
                  null,
                  'Fall instance of future academic year did not update to "Retired"'
                );
                notStrictEqual(
                  await within(editSpringOfferedButton.parentElement)
                    .findByText(offeredEnumToString(OFFERED.RETIRED)),
                  null,
                  'Spring instance of future academic year did not update to "Retired"'
                );
              });
            });
          });
          context('for a future course instance', function () {
            const futureAcademicYear = currentAcademicYear + 2;
            beforeEach(async function () {
              // Close the modal editing an instance of the current academic year
              const cancel = renderResult.getByText('Cancel');
              fireEvent.click(cancel);
              // Navigate to the next academic year
              const academicYearSelector = await renderResult.findByLabelText('Academic Year', { exact: false }) as HTMLSelectElement;
              fireEvent.change(academicYearSelector, {
                target: {
                  value: futureAcademicYear,
                },
              });
              await renderResult.findByText(courseNumber);
              const courseRows = await renderResult.findAllByRole('row');
              const courseRowToUpdate = courseRows.find((row) => {
                const rowHeader = within(row).queryByRole('rowheader');
                return rowHeader?.textContent === courseNumber;
              });
              ([editFallOfferedButton] = await within(courseRowToUpdate)
                .findAllByLabelText(
                  `Edit offered value for ${courseNumber}, ${currentTerm} ${futureAcademicYear - 1}`,
                  { exact: false }
                ));
              fireEvent.click(editFallOfferedButton);
              await renderResult.findByRole('dialog');
              const offeredSelector = await renderResult.findByLabelText('Edit Offered Value Dropdown', { exact: false });
              fireEvent.change(offeredSelector, {
                target: {
                  value: OFFERED.RETIRED,
                },
              });
              const saveButton = renderResult.getByText('Save');
              fireEvent.click(saveButton);
              await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
              // Show the retired courses
              const retiredCheckbox = renderResult.getByLabelText('Show Retired', { exact: false }) as HTMLInputElement;
              fireEvent.click(retiredCheckbox);
              await renderResult.findByText(courseNumber);
            });
            context('when the modal save button is clicked', function () {
              it('should close the modal', function () {
                const modal = renderResult.queryByRole('dialog');
                strictEqual(modal, null);
              });
              it('should show a success message', async function () {
                return renderResult.findByText('Course updated', { exact: false });
              });
              it('should update the offered value of the saved instance', async function () {
                const courseRows = await renderResult.findAllByRole('row');
                const courseRowToUpdate = courseRows.find((row) => {
                  const rowHeader = within(row).queryByRole('rowheader');
                  return rowHeader?.textContent === courseNumber;
                });
                ([editFallOfferedButton] = await within(courseRowToUpdate)
                  .findAllByLabelText(
                    `Edit offered value for ${courseNumber}, ${currentTerm} ${futureAcademicYear - 1}`,
                    { exact: false }
                  ));
                return within(editFallOfferedButton.parentElement)
                  .findByText(offeredEnumToString(OFFERED.RETIRED));
              });
              it('should update the offered value of future course instances to be OFFERED.RETIRED', async function () {
                // Check the retired value of the Spring semester of the same year
                const courseRows = await renderResult.findAllByRole('row');
                const courseRowToUpdate = courseRows.find((row) => {
                  const rowHeader = within(row).queryByRole('rowheader');
                  return rowHeader?.textContent === courseNumber;
                });
                ([editSpringOfferedButton] = await within(courseRowToUpdate)
                  .findAllByLabelText(
                    `Edit offered value for ${courseNumber}, ${TERM.SPRING} ${futureAcademicYear}`,
                    { exact: false }
                  ));
                notStrictEqual(
                  await within(editSpringOfferedButton.parentElement)
                    .findByText(offeredEnumToString(OFFERED.RETIRED)),
                  null,
                  'Spring instance did not update to "Retired"'
                );
                // Navigate to the next academic year to check offered values
                const academicYearSelector = await renderResult.findByLabelText('Academic Year', { exact: false }) as HTMLSelectElement;
                fireEvent.change(academicYearSelector, {
                  target: {
                    value: futureAcademicYear + 1,
                  },
                });
                await waitForElementToBeRemoved(() => renderResult.getByText('Fetching Course Data'));
                const futureCourseRows = await renderResult.findAllByRole('row');
                const futureCourseRowToUpdate = futureCourseRows.find((row) => {
                  const rowHeader = within(row).queryByRole('rowheader');
                  return rowHeader?.textContent === courseNumber;
                });
                ([editFallOfferedButton] = await within(futureCourseRowToUpdate)
                  .findAllByLabelText(
                    `Edit offered value for ${courseNumber}, ${TERM.FALL} ${futureAcademicYear}`,
                    { exact: false }
                  ));
                ([editSpringOfferedButton] = await within(
                  futureCourseRowToUpdate
                )
                  .findAllByLabelText(
                    `Edit offered value for ${courseNumber}, ${TERM.SPRING} ${futureAcademicYear + 1}`,
                    { exact: false }
                  ));
                notStrictEqual(
                  await within(editFallOfferedButton.parentElement)
                    .findByText(offeredEnumToString(OFFERED.RETIRED)),
                  null,
                  'Fall instance of future academic year did not update to "Retired"'
                );
                notStrictEqual(
                  await within(editSpringOfferedButton.parentElement)
                    .findByText(offeredEnumToString(OFFERED.RETIRED)),
                  null,
                  'Spring instance of future academic year did not update to "Retired"'
                );
              });
            });
          });
        });
        context('from "Retired" to a different offered value', function () {
          const updatedRetiredValue = OFFERED.Y;
          beforeEach(async function () {
            // Change the Fall offered value to OFFERED.RETIRED
            const offeredSelector = await renderResult.findByLabelText('Edit Offered Value Dropdown', { exact: false });
            fireEvent.change(offeredSelector, {
              target: {
                value: OFFERED.RETIRED,
              },
            });
            const saveButton = renderResult.getByText('Save');
            fireEvent.click(saveButton);
            // Wait for the modal to close
            await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
            // Click the Show Retired button to reveal newly retired course
            const retiredCheckbox = renderResult.getByLabelText('Show Retired', { exact: false }) as HTMLInputElement;
            fireEvent.click(retiredCheckbox);
            await renderResult.findByText(courseNumber);
            const courseRows = await renderResult.findAllByRole('row');
            const courseRowToUpdate = courseRows.find((row) => {
              const rowHeader = within(row).queryByRole('rowheader');
              return rowHeader?.textContent === courseNumber;
            });
            ([editFallOfferedButton] = await within(courseRowToUpdate)
              .findAllByLabelText(
                `Edit offered value for ${courseNumber}, ${currentTerm} ${currentAcademicYear - 1}`,
                { exact: false }
              ));
            // Reopen the modal
            fireEvent.click(editFallOfferedButton);
            await renderResult.findByRole('dialog');
            const reopenedModalOfferedSelector = await renderResult.findByLabelText('Edit Offered Value Dropdown', { exact: false });
            // Change the Fall offered value to OFFERED.Y
            fireEvent.change(reopenedModalOfferedSelector, {
              target: {
                value: updatedRetiredValue,
              },
            });
            // Save the modal
            fireEvent.click(renderResult.getByText('Save'));
            // Wait for the modal to close
            await waitForElementToBeRemoved(() => renderResult.queryByRole('dialog'));
          });
          it('updates the offered value of the saved instance to the requested update value', async function () {
            const courseRows = await renderResult.findAllByRole('row');
            const courseRowToUpdate = courseRows.find((row) => {
              const rowHeader = within(row).queryByRole('rowheader');
              return rowHeader?.textContent === courseNumber;
            });
            ([editFallOfferedButton] = await within(courseRowToUpdate)
              .findAllByLabelText(
                `Edit offered value for ${courseNumber}, ${currentTerm} ${currentAcademicYear - 1}`,
                { exact: false }
              ));
            notStrictEqual(
              await within(editFallOfferedButton.parentElement)
                .findByText(offeredEnumToString(updatedRetiredValue)),
              null
            );
          });
          it('updates the offered values of future course instances to be OFFERED.BLANK', async function () {
            const futureAcademicYear = currentAcademicYear + 1;
            // Display Academic Year Selector
            const academicYearSelector = await renderResult.findByLabelText('Academic Year', { exact: false }) as HTMLSelectElement;
            fireEvent.change(academicYearSelector, {
              target: {
                value: futureAcademicYear,
              },
            });
            await waitForElementToBeRemoved(() => renderResult.getByText('Fetching Course Data'));
            const courseRows = await renderResult.findAllByRole('row');
            const courseRowToUpdate = courseRows.find((row) => {
              const rowHeader = within(row).queryByRole('rowheader');
              return rowHeader?.textContent === courseNumber;
            });
            ([editFallOfferedButton] = await within(courseRowToUpdate)
              .findAllByLabelText(
                `Edit offered value for ${courseNumber}, ${currentTerm} ${futureAcademicYear - 1}`,
                { exact: false }
              ));
            ([editSpringOfferedButton] = await within(courseRowToUpdate)
              .findAllByLabelText(
                `Edit offered value for ${courseNumber}, ${TERM.SPRING} ${futureAcademicYear}`,
                { exact: false }
              ));
            strictEqual(
              within(editFallOfferedButton.parentElement)
                .queryByText(offeredEnumToString(OFFERED.RETIRED))
            && within(editFallOfferedButton.parentElement)
              .queryByText(offeredEnumToString(OFFERED.Y))
            && within(editFallOfferedButton.parentElement)
              .queryByText(offeredEnumToString(OFFERED.N)),
              null,
              'Future fall instance was not set to OFFERED.BLANK'
            );
            strictEqual(
              within(editSpringOfferedButton.parentElement)
                .queryByText(offeredEnumToString(OFFERED.RETIRED))
            && within(editSpringOfferedButton.parentElement)
              .queryByText(offeredEnumToString(OFFERED.Y))
            && within(editSpringOfferedButton.parentElement)
              .queryByText(offeredEnumToString(OFFERED.N)),
              null,
              'Future spring instance was not set to OFFERED.BLANK'
            );
          });
        });
      });
    });
    describe('Setting custom view columns', function () {
      context('With sessionStorage available', function () {
        let fakeSessionStorage: Storage;
        let fakeStorageMap: Map<string, string>;
        // Substitute a JS map for our storage backend
        beforeEach(function () {
          fakeStorageMap = new Map();
          fakeSessionStorage = {
            setItem: (key, value) => { fakeStorageMap.set(key, value); },
            getItem: (key) => (
              fakeStorageMap.has(key)
                ? fakeStorageMap.get(key)
                : null
            ),
            removeItem: (key) => { fakeStorageMap.delete(key); },
            length: fakeStorageMap.size,
            clear: () => { fakeStorageMap.clear(); },
            key: (index) => {
              const values = fakeStorageMap.values();
              return values[index] as string;
            },
          };
          stub(global.window, 'sessionStorage').get(() => fakeSessionStorage);
        });
        it('Should preserve custom columns after navigating/returning', async function () {
          renderResult = render(
            <MemoryRouter initialEntries={['/courses']}>
              <App />
            </MemoryRouter>
          );

          // Get a list of our initial headings
          await waitForElementToBeRemoved(() => renderResult.getByText('Fetching User Data'));
          await waitForElementToBeRemoved(() => renderResult.getByText('Fetching Course Data'));
          const initialRows = await renderResult.findAllByRole('row');
          const initialHeadings = within(initialRows[1]).getAllByRole('columnheader')
            .map(({ textContent }) => textContent);

          // Update the view to only show the minimal number of columns
          const customViewButton = await renderResult.findByText(/Customize View/);
          fireEvent.click(customViewButton);
          const modal = await renderResult.findByRole('dialog');
          const columnBoxes = within(modal).getAllByRole('checkbox');
          columnBoxes.forEach((box: HTMLInputElement) => {
            if (box.checked && !box.disabled) {
              fireEvent.click(box);
            }
          });
          fireEvent.click(within(modal).getByText('Done'));

          // Get the list of updated Headings
          const tableRows = renderResult.getAllByRole('row');
          const customHeadings = within(tableRows[0]).getAllByRole('columnheader')
            .map(({ textContent }) => textContent);
          const mandatoryHeadings = tableFields
            .filter(({ viewColumn }) => MANDATORY_COLUMNS.includes(viewColumn))
            .map(({ name }) => name);

          // Compare to ensure that they changed to our mandatory columns
          notDeepStrictEqual(
            customHeadings,
            initialHeadings,
            'Columns headings did not update when modal closed'
          );
          deepStrictEqual(
            customHeadings,
            mandatoryHeadings,
            'Columns shown do not match the mandatory columns'
          );

          // Navigate to our 4 year plan page
          fireEvent.click(renderResult.getByText('4 Year Plan'));
          await renderResult.findAllByText(/(F|S)'\d\d Instructors/);

          // Go back to courses; Columns should be the same
          fireEvent.click(renderResult.getByText('Courses'));
          await waitForElementToBeRemoved(() => renderResult.getByText('Fetching Course Data'));
          const returnTableRows = await renderResult.findAllByRole('row');
          const returnHeadings = within(returnTableRows[0])
            .getAllByRole('columnheader')
            .map(({ textContent }) => textContent);
          notDeepStrictEqual(
            returnHeadings,
            initialHeadings,
            'After returning, columns heading reverted to initial set'
          );
          deepStrictEqual(
            returnHeadings,
            customHeadings,
            'After returning, columns do not match what was selected'
          );
        });
      });
      context('Without sessionStorage available', function () {
        it('Reverts to the initial columns on page load', async function () {
          renderResult = render(
            <MemoryRouter initialEntries={['/courses']}>
              <App />
            </MemoryRouter>
          );

          // Get a list of our initial headings
          await waitForElementToBeRemoved(() => renderResult.getByText('Fetching User Data'));
          await waitForElementToBeRemoved(() => renderResult.getByText('Fetching Course Data'));
          const initialRows = await renderResult.findAllByRole('row');
          const initialHeadings = within(initialRows[1]).getAllByRole('columnheader')
            .map(({ textContent }) => textContent);

          // Update the view to only show the minimal number of columns
          const customViewButton = await renderResult.findByText(/Customize View/);
          fireEvent.click(customViewButton);
          const modal = await renderResult.findByRole('dialog');
          const columnBoxes = within(modal).getAllByRole('checkbox');
          columnBoxes.forEach((box: HTMLInputElement) => {
            if (box.checked && !box.disabled) {
              fireEvent.click(box);
            }
          });
          fireEvent.click(within(modal).getByText('Done'));

          // Get the list of updated Headings
          const tableRows = renderResult.getAllByRole('row');
          const customHeadings = within(tableRows[0]).getAllByRole('columnheader')
            .map(({ textContent }) => textContent);
          const mandatoryHeadings = tableFields
            .filter(({ viewColumn }) => MANDATORY_COLUMNS.includes(viewColumn))
            .map(({ name }) => name);

          // Compare to ensure that they changed to our mandatory columns
          notDeepStrictEqual(
            customHeadings,
            initialHeadings,
            'Columns headings did not update when modal closed'
          );
          deepStrictEqual(
            customHeadings,
            mandatoryHeadings,
            'Columns shown do not match the mandatory columns'
          );

          // Navigate to our 4 year plan page
          fireEvent.click(renderResult.getByText('4 Year Plan'));
          await renderResult.findAllByText(/(F|S)'\d\d Instructors/);

          // Go back to courses; Columns should have reverted
          fireEvent.click(renderResult.getByText('Courses'));
          await waitForElementToBeRemoved(() => renderResult.getByText('Fetching Course Data'));
          const returnTableRows = await renderResult.findAllByRole('row');
          const returnHeadings = within(returnTableRows[1])
            .getAllByRole('columnheader')
            .map(({ textContent }) => textContent);
          deepStrictEqual(
            returnHeadings,
            initialHeadings,
            'After returning, columns heading did not revert to initial set'
          );
          notDeepStrictEqual(
            returnHeadings,
            customHeadings,
            'After returning, columns are still set to the custom set'
          );
        });
      });
    });
    describe('Updating Enrollment Values', function () {
      let editFallEnrollmentButton: HTMLElement;
      let modal: HTMLDivElement;
      let textBoxes: HTMLInputElement[];
      let instanceToUpdate: CourseInstance;
      let windowConfirmStub: SinonStub;
      beforeEach(async function () {
        const [prefix, number] = courseNumber.split(' ');
        const course = await courseRepository.findOneOrFail(
          {
            prefix,
            number,
          },
          {
            relations: [
              'instances',
              'instances.semester',
            ],
          }
        );
        stub(global.window, 'sessionStorage').get(() => ({
          setItem: stub(),
          getItem: () => JSON.stringify([
            COURSE_TABLE_COLUMN.CATALOG_NUMBER,
            COURSE_TABLE_COLUMN.ENROLLMENT,
          ]),
          removeItem: stub(),
          length: 1,
        }));
        windowConfirmStub = stub(window, 'confirm');
        windowConfirmStub.returns(true);
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
        ([editFallEnrollmentButton] = await within(courseRowToUpdate)
          .findAllByLabelText(
            `Edit enrollment for ${courseNumber} in ${currentTerm} ${currentAcademicYear - 1}`,
            { exact: false }
          ));
        fireEvent.click(editFallEnrollmentButton);
        instanceToUpdate = course.instances.find(({ semester }) => (
          semester.term === currentTerm
        && semester.academicYear === (currentAcademicYear - 1).toString()
        ));
        (modal = await renderResult.findByRole('dialog') as HTMLDivElement);
        (
          textBoxes = await within(modal)
            .findAllByRole('textbox') as HTMLInputElement[]
        );
      });
      describe('saving', function () {
        it('shows a spinner', async function () {
          textBoxes.forEach((textbox) => {
            fireEvent.change(textbox, {
              target: { value: '30' },
            } as Partial<ChangeEvent<HTMLInputElement>>);
          });
          const saveButton = await within(modal).findByText('Save');
          fireEvent.click(saveButton);
          return within(modal).findByText('saving', { exact: false });
        });
        it('hides the save button', async function () {
          textBoxes.forEach((textbox) => {
            fireEvent.change(textbox, {
              target: { value: '30' },
            } as Partial<ChangeEvent<HTMLInputElement>>);
          });
          const saveButton = await within(modal).findByText('Save');
          fireEvent.click(saveButton);
          strictEqual(within(modal).queryByText('Save'), null);
        });
      });
      it('shows an unsaved changes dialog if the modal is closed without saving changes made', function () {
        // Type some text in the text boxes
        textBoxes.forEach((textbox) => {
          fireEvent.change(textbox, {
            target: { value: '10' },
          } as Partial<ChangeEvent<HTMLInputElement>>);
        });
        const modalBackground = renderResult.getByRole('dialog').parentElement;
        fireEvent.click(modalBackground);
        strictEqual(windowConfirmStub.callCount, 1);
      });
      it('clears any validation errors on close', async function () {
        // Generate some errors for the validation to yell about
        textBoxes.forEach((textbox) => {
          fireEvent.change(textbox, {
            target: { value: string },
          } as Partial<ChangeEvent<HTMLInputElement>>);
        });

        // Close the modal by clicking the modal background
        fireEvent.click(modal.parentElement);

        // Tell the window.confirm hook to allow the modal to close
        windowConfirmStub.returns(true);

        // Re-open the modal
        fireEvent.click(editFallEnrollmentButton);

        // Re-find the new modal
        modal = await renderResult.findByRole('dialog') as HTMLDivElement;

        strictEqual(within(modal).queryAllByRole('alert').length, 0);
      });
      describe('input fields', function () {
        it('can be numeric', async function () {
          const enrollmentValues = [];
          textBoxes.forEach((textbox, index) => {
            // An arbitary "numerical"(as a string) value to fill in - the
            // actual value isn't terribly important for this test
            const value = ((index + 1) * 10);
            enrollmentValues.push(value.toString());
            fireEvent.change(textbox, {
              target: { value },
            });
          });
          const saveButton = await within(modal).findByText('Save');
          fireEvent.click(saveButton);
          await waitForElementToBeRemoved(
            () => renderResult.getByText('Enrollment for', { exact: false })
          );
          const {
            preEnrollment,
            studyCardEnrollment,
            actualEnrollment,
          } = await courseInstanceRepository.findOne(instanceToUpdate.id);
          deepStrictEqual(
            [
              preEnrollment,
              studyCardEnrollment,
              actualEnrollment,
            ],
            enrollmentValues.map((number) => parseInt(number, 10) ?? null),
            'Database was not updated'
          );
          deepStrictEqual(
            [
              renderResult.queryByLabelText('Pre-Registration'),
              renderResult.queryByLabelText('Enrollment Deadline'),
              renderResult.queryByLabelText('Final Enrollment'),
            ].map((element) => element?.textContent.trim() ?? null),
            enrollmentValues,
            'Local state was not updated'
          );
          return renderResult.findByText(/Course updated/);
        });
        it('can be null', async function () {
          textBoxes.forEach((textbox) => {
            fireEvent.change(textbox, {
              target: { value: '' },
            });
          });
          const saveButton = await within(modal).findByText('Save');
          fireEvent.click(saveButton);
          await waitForElementToBeRemoved(
            () => renderResult.getByText('Enrollment for', { exact: false })
          );

          const {
            preEnrollment,
            studyCardEnrollment,
            actualEnrollment,
          } = await courseInstanceRepository.findOne(instanceToUpdate.id);
          deepStrictEqual(
            [
              preEnrollment,
              studyCardEnrollment,
              actualEnrollment,
            ],
            new Array(textBoxes.length).fill(null),
            'Database was not updated'
          );
          deepStrictEqual(
            [
              renderResult.queryByLabelText('Pre-Registration'),
              renderResult.queryByLabelText('Enrollment Deadline'),
              renderResult.queryByLabelText('Final Enrollment'),
            ],
            new Array(textBoxes.length).fill(null),
            'Local state was not updated'
          );
          return renderResult.findByText(/Course updated/);
        });
        it('must not contain negative values', async function () {
          const enrollmentValues = [];
          textBoxes.forEach((textbox, index) => {
            const value = (-(index + 1) * 10).toString();
            enrollmentValues.push(value);
            fireEvent.change(textbox, {
              target: {
                value,
              },
            } as Partial<ChangeEvent<HTMLInputElement>>);
          });
          return within(modal)
            .findAllByText('must be a positive whole number', { exact: false });
        });
        it('must not contain alphabetical characters', async function () {
          textBoxes.forEach((textbox) => {
            fireEvent.change(textbox, {
              target: { value: string },
            } as Partial<ChangeEvent<HTMLInputElement>>);
          });
          return within(modal)
            .findAllByText('must be a positive whole number', { exact: false });
        });
        it('must not contain special characters', async function () {
          textBoxes.forEach((textbox) => {
            fireEvent.change(textbox, {
              target: { value: '%!@#$' },
            } as Partial<ChangeEvent<HTMLInputElement>>);
          });
          return within(modal)
            .findAllByText('must be a positive whole number', { exact: false });
        });
      });
    });
  });
});
