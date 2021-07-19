import React from 'react';
import { strictEqual, deepStrictEqual } from 'assert';
import { stub, SinonStub } from 'sinon';
import {
  render,
  BoundFunction,
  QueryByText,
  FindByText,
  wait,
} from 'test-utils';
import { NonClassMeetingApi } from 'client/api';
import { AppMessage, MESSAGE_TYPE, MESSAGE_ACTION } from 'client/classes';
import { MessageReducerAction } from 'client/context';
import { dataScienceReadingGroup } from 'testData';
import NonClassMeetingsPage from '../NonClassMeetingsPage';

describe('Non Class Meetings', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  beforeEach(function () {
    getStub = stub(NonClassMeetingApi, 'getNonClassMeetings');
    dispatchMessage = stub();
  });
  describe('fetching data on render', function () {
    context('When API request succeeds', function () {
      let findByText: BoundFunction<FindByText>;
      beforeEach(function () {
        getStub.resolves({
          [dataScienceReadingGroup.spring.academicYear]: [
            dataScienceReadingGroup,
          ],
        });
        ({ findByText } = render(<NonClassMeetingsPage />));
      });
      it('calls the fetch function on render', function () {
        strictEqual(getStub.callCount, 1);
      });
      it('renders the data in the table', async function () {
        await findByText(dataScienceReadingGroup.title);
      });
    });
    context('When API request fails', function () {
      let queryByText: BoundFunction<QueryByText>;
      const errorMessage = 'Failed to retrieve non class event data';
      beforeEach(function () {
        getStub.rejects(new Error(errorMessage));
        ({ queryByText } = render(<NonClassMeetingsPage />, {
          dispatchMessage,
        }));
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
});
