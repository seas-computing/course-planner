import React from 'react';
import { render } from 'test-utils';
import { ok, strictEqual, deepStrictEqual } from 'assert';
import { spy } from 'sinon';
import * as dummy from 'testData';
import { RenderResult, within, fireEvent } from '@testing-library/react';
import RoomSelectionTable, { AVAILABILITY } from '../RoomSelectionTable';

describe('Room Selection Table', function () {
  let renderResult: RenderResult;
  const unavailableRooms = [
    dummy.bookedRoom,
    dummy.multiBookedRoom,
  ];
  const availableRooms = [
    dummy.freeRoom,
    dummy.freeFASRoom,
  ];
  const fullRoomList = [
    ...unavailableRooms,
    ...availableRooms,
  ];
  describe('Rendering Conditions', function () {
    describe('Availability Filter', function () {
      beforeEach(function () {
        renderResult = render(
          <RoomSelectionTable
            roomList={[...fullRoomList]}
            addButtonHandler={spy()}
          />
        );
      });
      context('When value is ALL', function () {
        it('Should be the default', function () {
          const { queryByRole } = renderResult;
          const filter = queryByRole('combobox') as HTMLSelectElement;
          strictEqual(filter.value, AVAILABILITY.ALL);
        });
        it('Should show all the rows', function () {
          const { queryAllByRole } = renderResult;
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, fullRoomList.length);
          const roomNames = tableBodyRows.map((row) => (
            within(row).queryByRole('rowheader').textContent
          ));
          deepStrictEqual(roomNames, fullRoomList.map(({ name }) => name));
        });
      });
      context('When value is AVAILABLE', function () {
        it('Should show all the available rows', function () {
          const { queryByRole, queryAllByRole } = renderResult;
          const filter = queryByRole('combobox');
          fireEvent.change(
            filter,
            {
              target: {
                value: AVAILABILITY.AVAILABLE,
              },
            }
          );
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, availableRooms.length);
          const roomNames = tableBodyRows.map((row) => (
            within(row).queryByRole('rowheader').textContent
          ));
          deepStrictEqual(roomNames, availableRooms.map(({ name }) => name));
        });
      });
      context('When value is UNAVAILABLE', function () {
        it('Should show all the unavailable rows', function () {
          const { queryByRole, queryAllByRole } = renderResult;
          const filter = queryByRole('combobox');
          fireEvent.change(
            filter,
            {
              target: {
                value: AVAILABILITY.UNAVAILABLE,
              },
            }
          );
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, unavailableRooms.length);
          const roomNames = tableBodyRows.map((row) => (
            within(row).queryByRole('rowheader').textContent
          ));
          deepStrictEqual(roomNames, unavailableRooms.map(({ name }) => name));
        });
      });
      context('When value is anything else', function () {
        it('Should default to showing everything', function () {
          const { queryByRole, queryAllByRole } = renderResult;
          const filter = queryByRole('combobox');
          fireEvent.change(
            filter,
            {
              target: {
                value: 'foo' as AVAILABILITY,
              },
            }
          );
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, fullRoomList.length);
          const roomNames = tableBodyRows.map((row) => (
            within(row).queryByRole('rowheader').textContent
          ));
          deepStrictEqual(roomNames, fullRoomList.map(({ name }) => name));
        });
      });
    });
    context('Availability Column', function () {
      context('When the room is available', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.freeRoom]}
              addButtonHandler={spy()}
            />
          );
        });
        it('Should show "Yes" in the availability column', function () {
          const { queryByText } = renderResult;
          ok(queryByText('Yes'));
        });
      });
      context('When a room in the list is occupied by one course', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.bookedRoom]}
              addButtonHandler={spy()}
            />
          );
        });
        it('Should show "No" and the name of the meeting', function () {
          const { queryByText } = renderResult;
          ok(queryByText(`No (${dummy.bookedRoom.meetingTitles[0]})`));
        });
      });
      context('When a room in the list is occupied by multiple courses', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.multiBookedRoom]}
              addButtonHandler={spy()}
            />
          );
        });
        it('Should show "No" and the list of meetings', function () {
          const { queryByText } = renderResult;
          ok(queryByText(`No (${dummy.multiBookedRoom.meetingTitles.join(', ')})`));
        });
      });
      context('When a room in the list is owned by FAS and is available', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.freeFASRoom]}
              addButtonHandler={spy()}
            />
          );
        });
        it('Should show check FAS availability', function () {
          const { queryByText } = renderResult;
          ok(queryByText('Check FAS Availability'));
        });
      });
      context('When a room in the list is owned by FAS and is not available', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.bookedFASRoom]}
              addButtonHandler={spy()}
            />
          );
        });
        it('Should show "No" and the name of the meeting', function () {
          const { queryByText } = renderResult;
          ok(queryByText(`No (${dummy.bookedFASRoom.meetingTitles[0]})`));
        });
      });
    });
  });
});
