import React from 'react';
import { render, waitForElementToBeRemoved, RenderResult } from 'test-utils';
import { stub, SinonStub, useFakeTimers, SinonFakeTimers } from 'sinon';
import * as CourseAPI from 'client/api/courses';
import { strictEqual } from 'assert';
import * as dummy from 'testData';
import { MetadataContextValue } from 'client/context/MetadataContext';
import SchedulePage from '../SchedulePage';

describe('Schedule Page', function () {
  let dispatchMessage: SinonStub;
  let apiStub: SinonStub;
  let clock: SinonFakeTimers;
  const metadata = new MetadataContextValue(
    { ...dummy.metadata, currentAcademicYear: 1999 },
    () => {}
  );

  beforeEach(function () {
    dispatchMessage = stub();
    apiStub = stub(CourseAPI, 'getCourseScheduleForSemester');
  });
  describe.only('Requesting Semester Data', function () {
    context('When current date is before July 1', function () {
      beforeEach(function () {
        console.log('Withnout timers', Date.now());
        apiStub.resolves([]);
        const fakeDate = new Date(1999, 5, 30);
        clock = useFakeTimers(fakeDate); 
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
      });
      it.only('Should fetch Spring data', function () {
        // Get academic year from contxt API
        // Get month from date object
        const [calendarYear, term] = apiStub.args[0];
        console.log(term, calendarYear);
        console.log('with timers', Date.now());
        //strictEqual(term.includes(/Spring/), true);
      });
      it('Should use the academicYear in metadata');
    })
    context('When current date is July 1 or later', function () {
      beforeEach(function () {
        apiStub.resolves([]);
        render(
          <SchedulePage />,
          { metadataContext: metadata }
        );
      });
      it('Should fetch Fall data');
      it('Should use the year before the academicYear in metadata')
    })
  })
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
