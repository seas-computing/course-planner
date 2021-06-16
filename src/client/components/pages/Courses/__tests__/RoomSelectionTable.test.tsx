import React from 'react';
import { render } from 'test-utils';
import { ok, strictEqual } from 'assert';
import { spy } from 'sinon';
import * as dummy from 'testData';
import { RenderResult } from '@testing-library/react';
import RoomSelectionTable from '../RoomSelectionTable';

describe('Room Selection Table', function () {
  let renderResult: RenderResult;
  describe('Rendering Conditions', function () {
    context('When data is fetching', function () {
      context('and the roomList is not empty', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[dummy.freeRoom, dummy.bookedRoom, dummy.fasRoom]}
              dataFetching
              addButtonHandler={spy()}
            />
          );
        });
        it('Should show the loading spinner', function () {
          const { queryByText } = renderResult;
          ok(queryByText('Searching for Rooms'));
        });
        it('Should only show the two header rows in the table', function () {
          const { getAllByRole } = renderResult;
          const tableRows = getAllByRole('row');
          strictEqual(tableRows.length, 2);
        });
      });
      context('and the roomList is empty', function () {
        beforeEach(function () {
          renderResult = render(
            <RoomSelectionTable
              roomList={[]}
              dataFetching
              addButtonHandler={spy()}
            />
          );
        });
        it('Should show the loading spinner', function () {
          const { queryByText } = renderResult;
          ok(queryByText('Searching for Rooms'));
        });
        it('Should not show the prompt', function () {
          const { queryByText } = renderResult;
          ok(!queryByText('Add meeting time to view room availability'));
        });
      });
    });
    context('When data is not fetching', function () {
      context('and the roomList is not empty', function () {
        context('When a room in the list is not occupied', function () {
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
          it('Should not render the spinner', function () {
            const { queryByText } = renderResult;
            ok(!queryByText('Searching for Rooms'));
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
          it('Should show "No" and the list of meetings', function () {
            const { queryByText } = renderResult;
            ok(queryByText(`No (${dummy.bookedRoom.meetingTitles[0]})`));
          });
          it('Should not render the spinner', function () {
            const { queryByText } = renderResult;
            ok(!queryByText('Searching for Rooms'));
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
          it('Should not render the spinner', function () {
            const { queryByText } = renderResult;
            ok(!queryByText('Searching for Rooms'));
          });
        });
        context('When a room in the list is owned by FAS', function () {
          beforeEach(function () {
            renderResult = render(
              <RoomSelectionTable
                roomList={[dummy.fasRoom]}
                addButtonHandler={spy()}
              />
            );
          });
          it('Should show check FAS availability', function () {
            const { queryByText } = renderResult;
            ok(queryByText('Check FAS Availability'));
          });
          it('Should not render the spinner', function () {
            const { queryByText } = renderResult;
            ok(!queryByText('Searching for Rooms'));
          });
        });
      });
      context('and the roomList is empty', function () {
        beforeEach(() => {
          renderResult = render(
            <RoomSelectionTable
              roomList={[]}
              addButtonHandler={spy()}
            />
          );
        });
        it('Should show the prompt to add a meeting Time', function () {
          const { queryByText } = renderResult;
          ok(queryByText('Add meeting time to view room availability'));
        });
        it('Should not render the spinner', function () {
          const { queryByText } = renderResult;
          ok(!queryByText('Searching for Rooms'));
        });
      });
    });
  });
});
