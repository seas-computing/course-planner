import React from 'react';
import { render } from 'test-utils';
import { ok } from 'assert';
import { spy } from 'sinon';
import * as dummy from 'testData';
import RoomSelectionTable from '../RoomSelectionTable';

describe('Room Selection Table', function () {
  describe('Rendering Conditions', function () {
    context('When data is fetching', function () {
      context('and the roomList is not empty', function () {
        it('Should show the loading spinner', function () {
          const { queryByText } = render(
            <RoomSelectionTable
              roomList={[dummy.freeRoom, dummy.bookedRoom, dummy.fasRoom]}
              dataFetching
              addButtonHandler={spy()}
            />,
            spy()
          );
          ok(queryByText('Searching for Rooms'));
        });
      });
      context('and the roomList is empty', function () {
        it('Should show the loading spinner', function () {
          const { queryByText } = render(
            <RoomSelectionTable
              roomList={[]}
              dataFetching
              addButtonHandler={spy()}
            />,
            spy()
          );
          ok(queryByText('Searching for Rooms'));
        });
      });
    });
    context('When data is not fetching', function () {
      context('and the roomList is not empty', function () {
        context('When a room in the list is not occupied', function () {
          it('Should show "Yes" in the availability column', function () {
            const { queryByText } = render(
              <RoomSelectionTable
                roomList={[dummy.freeRoom]}
                addButtonHandler={spy()}
              />,
              spy()
            );
            ok(queryByText('Yes'));
          });
        });
        context('When a room in the list is occupied', function () {
          it('Should show "No" and the list of meetings', function () {
            const { queryByText } = render(
              <RoomSelectionTable
                roomList={[dummy.bookedRoom]}
                addButtonHandler={spy()}
              />,
              spy()
            );
            ok(queryByText(`No (${dummy.bookedRoom.meetingTitles.join(', ')})`));
          });
        });
        context('When a room in the list is owned by FAS', function () {
          it('Should show check FAS availability', function () {
            const { queryByText } = render(
              <RoomSelectionTable
                roomList={[dummy.fasRoom]}
                addButtonHandler={spy()}
              />,
              spy()
            );
            ok(queryByText('Check FAS Availability'));
          });
        });
      });
      context('and the roomList is empty', function () {
        it('Should show the prompt to add a meeting Time', function () {
          const { queryByText } = render(
            <RoomSelectionTable
              roomList={[]}
              addButtonHandler={spy()}
            />,
            spy()
          );
          ok(queryByText('Add meeting time to view room availability'));
        });
      });
    });
  });
});
