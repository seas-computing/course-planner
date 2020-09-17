import React from 'react';
import { strictEqual, deepStrictEqual } from 'assert';
import { stub, SinonStub } from 'sinon';
import {
  render, BoundFunction, QueryByText, FindByText, wait,
} from 'common/utils';
import { CourseAPI } from 'client/api';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MessageReducerAction } from 'client/context';
import { cs50CourseInstance } from 'common/data';
import CoursesPage from '../CoursesPage';

describe('Course Instances List', function () {
  let getStub: SinonStub;
  let dispatchStub: SinonStub;
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getCourseInstancesForYear');
    dispatchStub = stub();
  });
  describe('fetching data on render', function () {
    context('When API request succeeds', function () {
      let findByText: BoundFunction<FindByText>;
      beforeEach(function () {
        getStub.resolves([
          [
            { ...cs50CourseInstance },
          ],
        ]);
        ({ findByText } = render(<CoursesPage />, dispatchStub));
      });
      it('calls the fetch function on render', function () {
        strictEqual(getStub.callCount, 1);
      });
      // TODO: Test "showRetired" when implemented
      // TODO: Test custom views when implemented
      // TODO: When the academic year is computed instead of hard-coded, bring
      // back this test:
      // it('requests data for the current academic year', function () {
      // const today = new Date();
      // let currentYear = today.getFullYear();
      // if (today.getMonth() > 5) {
      // currentYear = today.getFullYear() + 1;
      // }
      // strictEqual(getStub.args[0][0], currentYear);
      // });
      it('renders the data in the table', async function () {
        await findByText('CS 050');
      });
    });
    context('When API request fails', function () {
      let queryByText: BoundFunction<QueryByText>;
      const errorMessage = 'Failed to retrieve course data';
      beforeEach(function () {
        getStub.rejects(new Error(errorMessage));
        ({ queryByText } = render(<CoursesPage />, dispatchStub));
      });
      it('Should call the dispatchStub function', async function () {
        await wait(() => queryByText('Fetching') === null);
        strictEqual(dispatchStub.callCount, 1);
      });
      it('Should include an error message describing the issue', async function () {
        await wait(() => queryByText('Fetching') === null);
        const testErrorAppMessage = new AppMessage(
          errorMessage,
          MESSAGE_TYPE.ERROR
        );
        const realMessage = dispatchStub.args[0][0] as MessageReducerAction;
        deepStrictEqual(realMessage.message, testErrorAppMessage);
        strictEqual(realMessage.type, MESSAGE_ACTION.PUSH);
      });
    });
  });
});
