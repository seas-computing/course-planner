import React from 'react';
import { render } from 'test-utils';
import { ok, strictEqual, deepStrictEqual } from 'assert';
import { spy, SinonSpy } from 'sinon';
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
  let addSpy: SinonSpy;
  beforeEach(function () {
    addSpy = spy();
  });
  describe('Rendering Conditions', function () {
    describe('Availability Filter', function () {
      beforeEach(function () {
        renderResult = render(
          <RoomSelectionTable
            roomList={[...fullRoomList]}
            addButtonHandler={addSpy}
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
    context('Room availability', function () {
      context('When the room is available', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.freeRoom]}
              addButtonHandler={addSpy}
            />
          );
        });
        it('Should show "Yes" in the availability column', function () {
          const { queryByText } = renderResult;
          ok(queryByText('Yes'));
        });
        it('Should not disable the add button', function () {
          const { getByRole } = renderResult;
          fireEvent.click(getByRole('button'));
          strictEqual(addSpy.callCount, 1);
        });
      });
      context('When a room in the list is occupied by one course', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.bookedRoom]}
              addButtonHandler={addSpy}
            />
          );
        });
        it('Should show "No" and the name of the meeting', function () {
          const { queryByText } = renderResult;
          ok(queryByText(`No (${dummy.bookedRoom.meetingTitles[0]})`));
        });
        it('Should Display "N/A" in the add column', function () {
          const { queryByText } = renderResult;
          ok(queryByText('N/A'));
        });
      });
      context('When a room in the list is occupied by multiple courses', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.multiBookedRoom]}
              addButtonHandler={addSpy}
            />
          );
        });
        it('Should show "No" and the list of meetings', function () {
          const { queryByText } = renderResult;
          ok(queryByText(`No (${dummy.multiBookedRoom.meetingTitles.join(', ')})`));
        });
        it('Should Display "N/A" in the add column', function () {
          const { queryByText } = renderResult;
          ok(queryByText('N/A'));
        });
      });
      context('When a room in the list is owned by FAS and is available', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.freeFASRoom]}
              addButtonHandler={addSpy}
            />
          );
        });
        it('Should show check FAS availability', function () {
          const { queryByText } = renderResult;
          ok(queryByText('Check FAS Availability'));
        });
        it('Should not disable the add button', function () {
          const { getByRole } = renderResult;
          fireEvent.click(getByRole('button'));
          strictEqual(addSpy.callCount, 1);
        });
      });
      context('When a room in the list is owned by FAS and is not available', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.bookedFASRoom]}
              addButtonHandler={addSpy}
            />
          );
        });
        it('Should show "No" and the name of the meeting', function () {
          const { queryByText } = renderResult;
          ok(queryByText(`No (${dummy.bookedFASRoom.meetingTitles[0]})`));
        });
        it('Should Display "N/A" in the add column', function () {
          const { queryByText } = renderResult;
          ok(queryByText('N/A'));
        });
      });
      context('When a room is already booked for the meeting', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.bookedRoom]}
              addButtonHandler={addSpy}
              currentRoomId={dummy.bookedRoom.id}
            />
          );
        });
        it('Should show "Current Room" in the availability column', function () {
          const { queryByText } = renderResult;
          ok(queryByText('Current Room'));
        });
        it('Should Display "N/A" in the add column', function () {
          const { queryByText } = renderResult;
          ok(queryByText('N/A'));
        });
      });
    });
  });
});
