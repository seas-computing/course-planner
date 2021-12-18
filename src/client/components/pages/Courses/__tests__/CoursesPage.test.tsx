import React from 'react';
import { strictEqual, deepStrictEqual } from 'assert';
import {
  stub,
  spy,
  SinonStub,
  SinonSpy,
} from 'sinon';
import {
  render,
  BoundFunction,
  QueryByText,
  FindByText,
  wait,
  AllByRole,
  within,
  fireEvent,
} from 'test-utils';
import { CourseAPI } from 'client/api';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MessageReducerAction } from 'client/context';
import { cs50CourseInstance } from 'testData';
import { isSEASEnumToString, IS_SEAS, OFFERED } from 'common/constants';
import { offeredEnumToString } from 'common/constants/offered';
import CoursesPage from '../CoursesPage';
import * as filters from '../../Filter';

describe('Course Instances List', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  let filterSpy: SinonSpy;
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getCourseInstancesForYear');
    dispatchMessage = stub();
  });
  describe('fetching data on render', function () {
    context('When API request succeeds', function () {
      let findByText: BoundFunction<FindByText>;
      beforeEach(function () {
        getStub.resolves([
          { ...cs50CourseInstance },
        ]);
        ({ findByText } = render(<CoursesPage />));
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
        ({ queryByText } = render(<CoursesPage />, { dispatchMessage }));
      });
      it('Should call the dispatchMessage function', async function () {
        await wait(() => queryByText('Fetching') === null);
        strictEqual(dispatchMessage.callCount, 1);
      });
      it('Should include an error message describing the issue', async function () {
        await wait(() => queryByText('Fetching') === null);
        const testErrorAppMessage = new AppMessage(
          errorMessage,
          MESSAGE_TYPE.ERROR
        );
        const realMessage = dispatchMessage.args[0][0] as MessageReducerAction;
        deepStrictEqual(realMessage.message, testErrorAppMessage);
        strictEqual(realMessage.type, MESSAGE_ACTION.PUSH);
      });
    });
  });
  describe('Filtering data', function () {
    let getAllByRole: BoundFunction<AllByRole>;
    const areaFilterLabel = 'The table will be filtered as selected in this area dropdown filter';
    const isSEASFilterLabel = 'The table will be filtered as selected in this isSEAS dropdown filter';
    const fallOfferedFilterLabel = 'The table will be filtered as selected in this fall offered dropdown filter';
    const springOfferedFilterLabel = 'The table will be filtered as selected in this spring offered dropdown filter';
    beforeEach(function () {
      filterSpy = spy(filters, 'listFilter');
      getStub.resolves([
        { ...cs50CourseInstance },
      ]);
      ({ getAllByRole } = render(<CoursesPage />));
    });
    context('when the area dropdown filter is changed', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const area = utils.getByLabelText(areaFilterLabel);
        filterSpy.resetHistory();
        fireEvent.change(area, { target: { value: 'AM' } });
        strictEqual(filterSpy.callCount, 1);
      });
    });
    context('when the isSEAS dropdown filter is called', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const isSEAS = utils.getByLabelText(isSEASFilterLabel);
        filterSpy.resetHistory();
        fireEvent.change(isSEAS,
          { target: { value: isSEASEnumToString(IS_SEAS.N) } });
        strictEqual(filterSpy.callCount, 1);
      });
    });
    context('when the fall offered dropdown filter is called', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const fallOffered = utils.getByLabelText(fallOfferedFilterLabel);
        filterSpy.resetHistory();
        fireEvent.change(fallOffered,
          { target: { value: offeredEnumToString(OFFERED.Y) } });
        strictEqual(filterSpy.callCount, 1);
      });
    });
    context('when the spring offered dropdown filter is called', function () {
      it('calls the listFilter function once for each filter', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const springOffered = utils.getByLabelText(springOfferedFilterLabel);
        filterSpy.resetHistory();
        fireEvent.change(springOffered,
          { target: { value: offeredEnumToString(OFFERED.N) } });
        strictEqual(filterSpy.callCount, 1);
      });
    });
  });
});
