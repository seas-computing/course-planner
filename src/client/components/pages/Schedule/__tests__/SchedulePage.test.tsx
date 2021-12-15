import React from 'react';
import { render, waitForElementToBeRemoved } from 'test-utils';
import {
  stub,
  SinonStub,
} from 'sinon';
import FakeTimers, { InstalledClock } from '@sinonjs/fake-timers';
import * as CourseAPI from 'client/api/courses';
import { strictEqual } from 'assert';
import * as dummy from 'testData';
import { MetadataContextValue } from 'client/context/MetadataContext';
import { TERM } from 'common/constants';
import SchedulePage from '../SchedulePage';

describe('Schedule Page', function () {
  let dispatchMessage: SinonStub;
  let apiStub: SinonStub;
  const testAcademicYear = 1999;
  const metadata = new MetadataContextValue(
    { ...dummy.metadata, currentAcademicYear: testAcademicYear },
    () => {}
  );
  beforeEach(function () {
    dispatchMessage = stub();
    apiStub = stub(CourseAPI, 'getCourseScheduleForSemester');
  });
  afterEach(function () {
    apiStub.restore();
  });
  describe('Requesting Semester Data', function () {
    let calendarYear: number;
    let term: TERM;
    let clock: InstalledClock;
    beforeEach(function () {
      apiStub.resolves([]);
      clock = FakeTimers.install({
        toFake: ['Date'],
      });
    });
    afterEach(function () {
      clock.uninstall();
    });
    context('When current date is before July 1', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 5, 30);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch Spring data', function () {
        strictEqual(term, TERM.SPRING);
      });
      it('Should use the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear);
      });
    });
    context('When current date is after July 1', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 11, 1);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch Fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the year before the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
    context('When current date is July 1', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 6, 1);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch Fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the year before the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
    context('When current date is new year\'s day', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 0, 1);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch spring data', function () {
        strictEqual(term, TERM.SPRING);
      });
      it('Should use the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear);
      });
    });
    context('When current date is new year\'s eve', function () {
      beforeEach(function () {
        const fakeDate = new Date(testAcademicYear, 11, 31);
        clock.tick(fakeDate.valueOf());
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
        ([calendarYear, term] = apiStub.args[0]);
      });
      it('Should fetch fall data', function () {
        strictEqual(term, TERM.FALL);
      });
      it('Should use the year before the academicYear in metadata', function () {
        strictEqual(calendarYear, testAcademicYear - 1);
      });
    });
  });
  context('While fetching data', function () {
    it('Should display the spinner', function () {
      apiStub.resolves([]);
      const { queryByText } = render(
        <SchedulePage />
      );
      const spinner = queryByText('Fetching Course Schedule');
      strictEqual(!!spinner, true);
    });
  });
  context('When the API call returns data', function () {
    context('when data is empty', function () {
      it('shows an error message saying there is no data', async function () {
        apiStub.resolves([]);
        const fakeDispatchMessage = stub();
        const { getByText } = render(
          <SchedulePage />,
          {
            dispatchMessage: fakeDispatchMessage,
          }
        );
        await waitForElementToBeRemoved(() => getByText(
          'Fetching Course Schedule'
        ));

        const dispachArgs = fakeDispatchMessage.args[0][0];
        const errorMsg = dispachArgs.message.text as string;
        strictEqual(
          errorMsg.includes('There is no schedule data'),
          true
        );
      });
    });
    context('when data is not empty', function () {
      it('Should render the data into the schedule', async function () {
        apiStub.resolves(dummy.testCourseScheduleData);
        const { queryByText } = render(
          <SchedulePage />
        );
        await waitForElementToBeRemoved(() => queryByText(
          'Fetching Course Schedule'
        ));
        strictEqual(apiStub.callCount, 1);
        const [testSessionBlock] = dummy.testCourseScheduleData;
        const [testCourseBlock] = testSessionBlock.courses;
        const sessionBlock = queryByText(testSessionBlock.coursePrefix);
        const courseListing = queryByText(testCourseBlock.courseNumber);
        strictEqual(!!sessionBlock, true);
        strictEqual(!!courseListing, true);
      });
    });
  });
  context('When the API call fails', function () {
    it('Should dispatch an error', async function () {
      apiStub.rejects(dummy.error);
      const { queryByText } = render(
        <SchedulePage />,
        { dispatchMessage }
      );
      await waitForElementToBeRemoved(() => queryByText(
        'Fetching Course Schedule'
      ));
      strictEqual(dispatchMessage.callCount, 1);
    });
  });
});
