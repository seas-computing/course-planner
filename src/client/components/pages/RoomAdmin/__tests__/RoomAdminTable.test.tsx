import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
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
  describe('data fetching', function () {
    context('when room data fetch succeeds', function () {
      beforeEach(function () {
        getStub = stub(LocationAPI, 'getAdminRooms');
        getStub.resolves(adminRoomsResponse);
      });
      context('when there are room records', function () {
        it('displays one table row per room', async function () {
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
          // An amalgamation of all room information
          const roomInfo = [
            secRoomResponse.name,
            secRoomResponse.building.name,
            secRoomResponse.building.campus.name,
            secRoomResponse.capacity.toString(),
            oxfordRoomResponse.name,
            oxfordRoomResponse.building.name,
            oxfordRoomResponse.building.campus.name,
            oxfordRoomResponse.capacity.toString(),
            bauerRoomResponse.name,
            bauerRoomResponse.building.name,
            bauerRoomResponse.building.campus.name,
            bauerRoomResponse.capacity.toString(),
          ];

          for (let i = 1; i < rows.length; i++) {
            rowsContent[i] = rowsContent[i].slice(0, -1);
            rowsContent[i].forEach((data) => {
              // Remove the Edit column, which contains no table data.
              strictEqual(
                roomInfo.includes(data),
                true,
                `${data} is not in the table as expected`
              );
            });
          }
        });
      });
      context('when there are no room records', function () {
        const emptyTestData = [];
        beforeEach(function () {
          getStub.resolves(emptyTestData);
        });
        it('displays only the header row', async function () {
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
