import React from 'react';
import { strictEqual, deepStrictEqual } from 'assert';
import { stub, SinonStub } from 'sinon';
import {
  render, BoundFunction, QueryByText, FindByText, wait,
} from 'test-utils';
import * as courseAPI from 'client/api';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import CourseInstanceList from '../CoursesPage';


describe('Course Instances List', function () {
  let getStub: SinonStub;
  let dispatchStub: SinonStub;
  beforeEach(function () {
    getStub = stub(courseAPI, 'getCourseInstancesForYear');
    dispatchStub = stub();
  });
  describe('fetching data on render', function () {
    context('When API request succeeds', function () {
      let findByText: BoundFunction<FindByText>;
      beforeEach(function () {
        getStub.resolves([
          [
            {
              id: 'abc123',
              area: 'CS',
              catalogNumber: 'CS 109A',
              title: 'Data Science',
            },
          ],
        ] as CourseInstanceResponseDTO[][]);
        ({ findByText } = render(<CourseInstanceList />, dispatchStub));
      });
      it('calls the fetch function on render', function () {
        strictEqual(getStub.callCount, 1);
      });
      it('requests data for the current academic years', function () {
        const today = new Date();
        let currentYear = today.getFullYear();
        if (today.getMonth() > 5) {
          currentYear = today.getFullYear() + 1;
        }
        strictEqual(getStub.args[0][0], currentYear);
      });
      it('renders the data in the table', async function () {
        await findByText('Data Science');
        await findByText('CS 109A');
        await findByText('CS');
      });
    });
    context('When API request fails', function () {
      let queryByText: BoundFunction<QueryByText>;
      const errorMessage = 'Failed to retrieve course data';
      beforeEach(function () {
        getStub.rejects(new Error(errorMessage));
        ({ queryByText } = render(<CourseInstanceList />, dispatchStub));
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
        deepStrictEqual(dispatchStub.args[0][0].message, testErrorAppMessage);
        strictEqual(dispatchStub.args[0][0].type, MESSAGE_ACTION.PUSH);
      });
    });
  });
});
