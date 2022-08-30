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
import { freeFASRoom, freeRoom, testRoomScheduleData } from 'testData';
import { LocationAPI } from 'client/api/rooms';
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
  describe('Semester Dropdown', function () {
    let renderResult: RenderResult;
    beforeEach(async function () {
      scheduleApiStub.resolves([]);
      getRoomListApiStub.resolves([
        freeFASRoom,
        freeRoom,
      ]);
      const fakeDate = new Date(testAcademicYear, 5, 30);
      clock = FakeTimers.install({
        toFake: ['Date'],
      });
      clock.tick(fakeDate.valueOf());
      renderResult = render(
        <RoomSchedule />,
        {
          metadataContext: metadata,
          dispatchMessage,
        }
      );
      const { findByRole, findByText, getByText } = renderResult;
      const selectRoomInput = await findByRole('textbox');
      fireEvent.change(
        selectRoomInput,
        {
          target: {
            value: freeFASRoom.name.substr(0, 10),
          },
        }
      );
      await findByText(freeFASRoom.name);
      fireEvent.click(getByText(freeFASRoom.name));
      await waitForElementToBeRemoved(() => getByText(
        'Fetching Room Schedule', { exact: false }
      ));
    });
    afterEach(function () {
      clock.uninstall();
    });
    it('renders the list of existing semesters', function () {
      const { semesters: metadataSemesters } = metadata;
      const { getByLabelText } = renderResult;
      const dropdown = getByLabelText(/semester/i);
      const options = within(dropdown).getAllByRole('option')
        .map(({ value }: HTMLOptionElement) => value);

      deepStrictEqual(metadataSemesters, options);
    });
    it('defaults to the current semester', function () {
      const { getByLabelText } = renderResult;
      const dropdown = getByLabelText(/semester/i) as HTMLSelectElement;
      const currentValue = dropdown.value;
      strictEqual(currentValue, `${TERM.SPRING} ${testAcademicYear}`);
    });
    it('requests the selected semester data', async function () {
      const { getByLabelText, getByText } = renderResult;
      const dropdown = getByLabelText(/semester/i) as HTMLSelectElement;
      fireEvent.change(dropdown, { target: { value: `${TERM.FALL} ${testAcademicYear}` } });
      await waitForElementToBeRemoved(() => getByText(
        'Fetching Room Schedule'
      ));
      // check the second call to the API
      const [, calendarYear, term] = scheduleApiStub.args[1];
      strictEqual(calendarYear, testAcademicYear);
      strictEqual(term, TERM.FALL);
    });
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
    context('When current date is before July 1', function () {
      beforeEach(async function () {
        const fakeDate = new Date(testAcademicYear, 5, 30);
        clock.tick(fakeDate.valueOf());
        const {
          getByText, findByText, findByRole,
        } = render(
          <RoomSchedule />,
          {
            metadataContext: metadata,
            dispatchMessage,
          }
        );
        const selectRoomInput = await findByRole('textbox');
        fireEvent.change(
          selectRoomInput,
          {
            target: {
              value: freeFASRoom.name.substr(0, 10),
            },
          }
        );
        await findByText(freeFASRoom.name);
        fireEvent.click(getByText(freeFASRoom.name));
        await waitForElementToBeRemoved(() => getByText(
          'Fetching Room Schedule'
        ));
        ([, calendarYear, term] = scheduleApiStub.args[0]);
      });
      it('Should fetch Spring data', function () {
        strictEqual(term, TERM.SPRING);
      });
      it('Should use the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear);
      });
    });
    context('When current date is after July 1', function () {
      beforeEach(async function () {
        const fakeDate = new Date(testAcademicYear, 8, 13);
        clock.tick(fakeDate.valueOf());
        const {
          getByText, findByText, findByRole,
        } = render(
          <RoomSchedule />,
          {
            metadataContext: metadata,
            dispatchMessage,
          }
        );
        const selectRoomInput = await findByRole('textbox');
        fireEvent.change(
          selectRoomInput,
          {
            target: {
              value: freeFASRoom.name.substr(0, 10),
            },
          }
        );
        await findByText(freeFASRoom.name);
        fireEvent.click(getByText(freeFASRoom.name));
        await waitForElementToBeRemoved(() => getByText(
          'Fetching Room Schedule'
        ));
        ([, calendarYear, term] = scheduleApiStub.args[0]);
      });
      it('Should fetch Fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the year before the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
    context('When current date is July 1', function () {
      beforeEach(async function () {
        const fakeDate = new Date(testAcademicYear, 6, 1);
        clock.tick(fakeDate.valueOf());
        const {
          getByText, findByText, findByRole,
        } = render(
          <RoomSchedule />,
          {
            metadataContext: metadata,
            dispatchMessage,
          }
        );
        const selectRoomInput = await findByRole('textbox');
        fireEvent.change(
          selectRoomInput,
          {
            target: {
              value: freeFASRoom.name.substr(0, 10),
            },
          }
        );
        await findByText(freeFASRoom.name);
        fireEvent.click(getByText(freeFASRoom.name));
        await waitForElementToBeRemoved(() => getByText(
          'Fetching Room Schedule'
        ));
        ([, calendarYear, term] = scheduleApiStub.args[0]);
      });
      it('Should fetch Fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the year before the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
    context('When current date is new year\'s day', function () {
      beforeEach(async function () {
        const fakeDate = new Date(testAcademicYear, 0, 1);
        clock.tick(fakeDate.valueOf());
        const {
          getByText, findByText, findByRole,
        } = render(
          <RoomSchedule />,
          {
            metadataContext: metadata,
            dispatchMessage,
          }
        );
        const selectRoomInput = await findByRole('textbox');
        fireEvent.change(
          selectRoomInput,
          {
            target: {
              value: freeFASRoom.name.substr(0, 10),
            },
          }
        );
        await findByText(freeFASRoom.name);
        fireEvent.click(getByText(freeFASRoom.name));
        await waitForElementToBeRemoved(() => getByText(
          'Fetching Room Schedule'
        ));
        ([, calendarYear, term] = scheduleApiStub.args[0]);
      });
      it('Should fetch Spring data', function () {
        strictEqual(term, TERM.SPRING);
      });
      it('Should use the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear);
      });
    });
    context('When current date is new year\'s eve', function () {
      beforeEach(async function () {
        const fakeDate = new Date(testAcademicYear, 11, 31);
        clock.tick(fakeDate.valueOf());
        const {
          getByText, findByText, findByRole,
        } = render(
          <RoomSchedule />,
          {
            metadataContext: metadata,
            dispatchMessage,
          }
        );
        const selectRoomInput = await findByRole('textbox');
        fireEvent.change(
          selectRoomInput,
          {
            target: {
              value: freeFASRoom.name.substr(0, 10),
            },
          }
        );
        await findByText(freeFASRoom.name);
        fireEvent.click(getByText(freeFASRoom.name));
        await waitForElementToBeRemoved(() => getByText(
          'Fetching Room Schedule'
        ));
        ([, calendarYear, term] = scheduleApiStub.args[0]);
      });
      it('Should fetch Fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
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
      it('Should display the spinner', async function () {
        const {
          queryByText, getByText, findByText, findByRole,
        } = render(
          <RoomSchedule />,
          { metadataContext: metadata }
        );
        const selectRoomInput = await findByRole('textbox');
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
        await findByText(freeFASRoom.name);
        fireEvent.click(getByText(freeFASRoom.name));
        const spinner = queryByText('Fetching Room Schedule');
        strictEqual(!!spinner, true);
      });
    });
    context('when the API call returns data', function () {
      context('when data is empty', function () {
        it('shows an error message saying there is no data', async function () {
          scheduleApiStub.resolves([]);
          const fakeDispatchMessage = stub();
          const {
            getByText, findByText, findByRole,
          } = render(
            <RoomSchedule />,
            {
              metadataContext: metadata,
              dispatchMessage: fakeDispatchMessage,
            }
          );
          const selectRoomInput = await findByRole('textbox');
          fireEvent.change(
            selectRoomInput,
            {
              target: {
                value: freeFASRoom.name.substr(0, 10),
              },
            }
          );
          await findByText(freeFASRoom.name);
          fireEvent.click(getByText(freeFASRoom.name));
          await waitForElementToBeRemoved(() => getByText(
            'Fetching Room Schedule'
          ));
          const dispatchArgs = fakeDispatchMessage.args[0][0];
          const errorMsg = dispatchArgs.message.text as string;
          strictEqual(
            errorMsg.includes('There is no schedule data'),
            true
          );
        });
      });
      context('when data is not empty', function () {
        it('should render the data into the schedule', async function () {
          const {
            getByText, findByText, findByRole, queryAllByText,
          } = render(
            <RoomSchedule />,
            { metadataContext: metadata }
          );
          const selectRoomInput = await findByRole('textbox');
          fireEvent.change(
            selectRoomInput,
            {
              target: {
                value: freeFASRoom.name.substr(0, 10),
              },
            }
          );
          await findByText(freeFASRoom.name);
          fireEvent.click(getByText(freeFASRoom.name));
          await waitForElementToBeRemoved(() => getByText(
            'Fetching Room Schedule'
          ));
          scheduleApiStub.resolves([testRoomScheduleData]);
          const [testSessionBlock] = testRoomScheduleData;
          const sessionBlock = queryAllByText(testSessionBlock.catalogNumber);
          strictEqual(!!sessionBlock, true);
        });
      });
    });
    context('When the API call fails', function () {
      it('Should dispatch an error', async function () {
        scheduleApiStub.rejects(dummy.error);
        const {
          getByText, findByText, findByRole,
        } = render(
          <RoomSchedule />,
          {
            metadataContext: metadata,
            dispatchMessage,
          }
        );
        const selectRoomInput = await findByRole('textbox');
        fireEvent.change(
          selectRoomInput,
          {
            target: {
              value: freeFASRoom.name.substr(0, 10),
            },
          }
        );
        await findByText(freeFASRoom.name);
        fireEvent.click(getByText(freeFASRoom.name));
        await waitForElementToBeRemoved(() => getByText(
          'Fetching Room Schedule'
        ));
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
