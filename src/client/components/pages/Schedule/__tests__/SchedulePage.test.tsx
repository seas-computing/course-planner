import React from 'react';
import { render, waitForElementToBeRemoved } from 'test-utils';
import { stub, SinonStub } from 'sinon';
import * as CourseAPI from 'client/api/courses';
import { strictEqual } from 'assert';
import * as dummy from 'testData';
import SchedulePage from '../SchedulePage';

describe('Schedule Page', function () {
  let msgStub: SinonStub;
  let apiStub: SinonStub;
  beforeEach(function () {
    msgStub = stub();
    apiStub = stub(CourseAPI, 'getCourseScheduleForSemester');
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
        msgStub
      );
      await waitForElementToBeRemoved(() => queryByText(
        'Fetching Course Schedule'
      ));
      strictEqual(msgStub.callCount, 1);
    });
  });
});
