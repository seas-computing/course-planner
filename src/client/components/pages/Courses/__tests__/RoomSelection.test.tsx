import React from 'react';
import { render } from 'test-utils';
import { ok, strictEqual } from 'assert';
import {
  spy, SinonSpy, stub, SinonStub,
} from 'sinon';
import * as dummy from 'testData';
import * as roomApi from 'client/api/rooms';
import { RenderResult, waitForElementToBeRemoved } from '@testing-library/react';
import RoomSelection from '../RoomSelection';

describe('Room Selection', function () {
  let renderResult: RenderResult;
  let fetchStub: SinonStub;
  const fullRoomList = [
    dummy.bookedRoom,
    dummy.multiBookedRoom,
    dummy.freeRoom,
    dummy.freeFASRoom,
  ];
  beforeEach(function () {
    fetchStub = stub(roomApi, 'getRoomAvailability');
  });
  describe('Rendering Conditions', function () {
    context('With no roomRequest data', function () {
      beforeEach(function () {
        renderResult = render(
          <RoomSelection
            roomRequestData={null}
            roomHandler={spy()}
          />
        );
      });
      it('Should show the prompt to add a meeting Time', function () {
        const { queryByText } = renderResult;
        ok(queryByText('Add meeting time to view room availability'));
      });
      it('Should show the two header rows of the table', function () {
        const { queryAllByRole } = renderResult;
        const tableRows = queryAllByRole('row');
        strictEqual(tableRows.length, 2);
      });
    });
    context('While data is fetching', function () {
      beforeEach(function () {
        fetchStub.callsFake(() => new Promise((resolve) => {
          setTimeout(() => resolve(fullRoomList), 1000);
        }));
      });
      it('Should show the loading spinner', async function () {
        const { findByText } = render(
          <RoomSelection
            roomRequestData={dummy.roomRequest}
            roomHandler={spy()}
          />
        );
        ok(await findByText('Searching for Rooms'));
      });
    });
    context('When fetch succeeds', function () {
      it('Should show the rooms in the list', async function () {
        fetchStub.resolves(fullRoomList);
        const { queryAllByRole, queryByText } = render(
          <RoomSelection
            roomRequestData={dummy.roomRequest}
            roomHandler={spy()}
          />
        );
        await waitForElementToBeRemoved(() => queryByText('Searching for Rooms'));
        const tableRows = queryAllByRole('row');
        strictEqual(tableRows.length, fullRoomList.length + 2);
      });
    });
    context('When fetch fails', function () {
      let dispatchMessage: SinonSpy;
      beforeEach(function () {
        dispatchMessage = spy();
        fetchStub.rejects(dummy.error);
      });
      it('Should dispatch an error message', async function () {
        const { queryByText } = render(
          <RoomSelection
            roomRequestData={dummy.roomRequest}
            roomHandler={spy()}
          />,
          { dispatchMessage }
        );
        await waitForElementToBeRemoved(() => queryByText('Searching for Rooms'));
        strictEqual(dispatchMessage.callCount, 1);
        strictEqual(
          dispatchMessage.args[0][0].message.text,
          dummy.error.message
        );
      });
    });
  });
});
