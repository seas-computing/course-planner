import React from 'react';
import {
  render,
  waitForElementToBeRemoved,
  within,
  RenderResult,
  fireEvent,
} from 'test-utils';
import {
  stub,
  SinonStub,
} from 'sinon';
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers';
import * as CourseAPI from 'client/api/courses';
import { strictEqual, deepStrictEqual } from 'assert';
import * as dummy from 'testData';
import { MetadataContextValue } from 'client/context/MetadataContext';
import { TERM } from 'common/constants';
import { freeFASRoom, freeRoom } from 'testData';
import * as LocationAPI from 'client/api/rooms';
import RoomSchedule from '../RoomSchedule';

describe('Room Schedule Page', function () {
  let dispatchMessage: SinonStub;
  let scheduleApiStub: SinonStub;
  let getRoomListApiStub: SinonStub;
  const testAcademicYear = 1999;
  let clock: InstalledClock;
  const metadata = new MetadataContextValue(
    {
      ...dummy.metadata,
      currentAcademicYear: testAcademicYear,
      semesters: [
        ...dummy.metadata.semesters,
        `${TERM.SPRING} ${testAcademicYear}`,
        `${TERM.FALL} ${testAcademicYear}`,
      ],
    },
    () => {}
  );
  beforeEach(function () {
    dispatchMessage = stub();
    scheduleApiStub = stub(CourseAPI, 'getRoomScheduleForSemester');
    getRoomListApiStub = stub(LocationAPI, 'getRooms');
  });
  afterEach(function () {
    scheduleApiStub.restore();
    getRoomListApiStub.restore();
  });
  describe('Requesting Semester Data', function () {
    let calendarYear: number;
    let term: TERM;
    beforeEach(function () {
      scheduleApiStub.resolves([]);
      getRoomListApiStub.resolves([
        freeFASRoom,
        freeRoom,
      ]);
      clock = FakeTimers.install({
        toFake: ['Date'],
      });
    });
    afterEach(function () {
      clock.uninstall();
    });
    // NOTE: Need to edit tests to account for the fact that a schedule is not
    // fetched until the user selects a room from the combobox.
    // context('When current date is before July 1', function () {
    //   beforeEach(function () {
    //     const fakeDate = new Date(testAcademicYear, 5, 30);
    //     clock.tick(fakeDate.valueOf());
    //     render(
    //       <RoomSchedule />,
    //       { metadataContext: metadata }
    //     );
    //     // TODO: Select a room from the combobox
    //     console.log('schedule API stub: ', scheduleApiStub.args[0]);
    //     ([, calendarYear, term] = scheduleApiStub.args[0]);
    //   });
    //   it('Should fetch Spring data', function () {
    //     strictEqual(term, TERM.SPRING);
    //   });
    //   it('Should use the academicYear in metadata', function () {
    //     strictEqual(calendarYear, testAcademicYear);
    //   });
    // });
    context('On initial page load', function () {
      it('Should prompt the user to select a room', function () {
        const { queryByText } = render(
          <RoomSchedule />,
          { metadataContext: metadata }
        );
        const instructions = queryByText('Please select a room to view the schedule.', { exact: false });
        strictEqual(!!instructions, true);
      });
    });
    context('While fetching data', function () {
      it.only('Should display the spinner', function () {
        getRoomListApiStub.resolves([
          freeFASRoom,
          freeRoom,
        ]);
        const { queryByText, getByRole, getByText } = render(
          <RoomSchedule />,
          { metadataContext: metadata }
        );
        const selectRoomInput = getByRole('textbox');
        fireEvent.change(
          selectRoomInput,
          {
            // Simulate typing the first 10 letters of the freeFASRoom so that
            // we can then select the freeFASRoom by getting the full room name
            // using getByText and using the click event.
            target: {
              value: freeFASRoom.name.substr(0, 10),
            },
          }
        );
        fireEvent.click(getByText(freeFASRoom.name));
        const spinner = queryByText('Fetching Room Schedule');
        strictEqual(!!spinner, true);
      });
    });
  });
});
