import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  waitForElement,
  wait,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import { render } from 'test-utils';
import { LocationAPI } from 'client/api';
import {
  adminRoomsResponse,
  bauerRoomResponse,
  error,
  oxfordRoomResponse,
  secRoomResponse,
} from 'testData';
import RoomAdmin from '../RoomAdmin';

describe('Room Admin Table', function () {
  let getStub: SinonStub;
  describe('rendering', function () {
    it('creates a table', async function () {
      const { container } = render(
        <RoomAdmin />
      );
      return waitForElement(() => container.querySelector('.room-admin-table'));
    });
  });
  describe('data fetching', function () {
    context('when room data fetch succeeds', function () {
      beforeEach(function () {
        getStub = stub(LocationAPI, 'getAdminRooms');
        getStub.resolves(adminRoomsResponse);
      });
      context('when there are room records', function () {
        it('displays the correct number of rows in the table', async function () {
          const { getAllByRole } = render(
            <RoomAdmin />
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          // The "+1" takes the table headers into account for the number of rows
          strictEqual(rows.length, adminRoomsResponse.length + 1);
        });
        it('displays the correct content in the table cells', async function () {
          const { getAllByRole } = render(
            <RoomAdmin />
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
          const rowsContent = rows
            .map(
              (row) => (Array.from(row.cells).map((cell) => cell.textContent))
            );
          const secRoomCampus = rowsContent[1][0];
          const secRoomBuilding = rowsContent[1][1];
          const secRoomName = rowsContent[1][2];
          const secRoomCapacity = rowsContent[1][3];
          const oxfordRoomCampus = rowsContent[2][0];
          const oxfordRoomBuilding = rowsContent[2][1];
          const oxfordRoomName = rowsContent[2][2];
          const oxfordRoomCapacity = rowsContent[2][3];
          const bauerRoomCampus = rowsContent[3][0];
          const bauerRoomBuilding = rowsContent[3][1];
          const bauerRoomName = rowsContent[3][2];
          const bauerRoomCapacity = rowsContent[3][3];
          strictEqual(
            secRoomCampus,
            secRoomResponse.building.campus.name,
            'The SEC campus is not being displayed as expected.'
          );
          strictEqual(
            secRoomBuilding,
            secRoomResponse.building.name,
            'The SEC building is not being displayed as expected.'
          );
          strictEqual(
            secRoomName,
            secRoomResponse.name,
            'The SEC room name is not being displayed as expected.'
          );
          strictEqual(
            secRoomCapacity,
            secRoomResponse.capacity.toString(),
            'The SEC room capacity is not being displayed as expected.'
          );
          strictEqual(
            oxfordRoomCampus,
            oxfordRoomResponse.building.campus.name,
            'The 60 Oxford Street campus is not being displayed as expected.'
          );
          strictEqual(
            oxfordRoomBuilding,
            oxfordRoomResponse.building.name,
            'The 60 Oxford Street building is not being displayed as expected.'
          );
          strictEqual(
            oxfordRoomName,
            oxfordRoomResponse.name,
            'The 60 Oxford Street room name is not being displayed as expected.'
          );
          strictEqual(
            oxfordRoomCapacity,
            oxfordRoomResponse.capacity.toString(),
            'The 60 Oxford Street room capacity is not being displayed as expected.'
          );
          strictEqual(
            bauerRoomCampus,
            bauerRoomResponse.building.campus.name,
            'The Bauer room campus is not being displayed as expected.'
          );
          strictEqual(
            bauerRoomBuilding,
            bauerRoomResponse.building.name,
            'The Bauer room building is not being displayed as expected.'
          );
          strictEqual(
            bauerRoomName,
            bauerRoomResponse.name,
            'The Bauer room name is not being displayed as expected.'
          );
          strictEqual(
            bauerRoomCapacity,
            bauerRoomResponse.capacity.toString(),
            'The Bauer room capacity is not being displayed as expected.'
          );
        });
      });
      context('when there are no room records', function () {
        const emptyTestData = [];
        beforeEach(function () {
          getStub.resolves(emptyTestData);
        });
        it('displays the correct number of rows in the table (only the header row)', async function () {
          const { getAllByRole } = render(
            <RoomAdmin />
          );
          await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
          const rows = getAllByRole('row');
          // With the filter, there are two table header rows
          strictEqual(rows.length, emptyTestData.length + 1);
        });
      });
    });
    context('when room data fetch fails', function () {
      const emptyTestData = [];
      let dispatchMessage: SinonStub;
      beforeEach(function () {
        dispatchMessage = stub();
        getStub = stub(LocationAPI, 'getAdminRooms');
        getStub.rejects(error);
      });
      afterEach(function () {
        getStub.restore();
      });
      it('should throw an error', async function () {
        const { getAllByRole } = render(
          <RoomAdmin />,
          { dispatchMessage }
        );
        await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
