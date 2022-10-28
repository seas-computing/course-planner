import React from 'react';
import {
  render,
  RenderResult,
  fireEvent,
} from 'test-utils';
import { testCourseScheduleData } from 'testData';
import { notStrictEqual, strictEqual, deepStrictEqual } from 'assert';
import ScheduleView from '../ScheduleView';
import { dayEnumToString } from '../../../../../common/constants/day';
import { PGTime } from '../../../../../common/utils/PGTime';
import { ScheduleViewResponseDTO, ScheduleEntry } from '../../../../../common/dto/schedule/schedule.dto';

describe('ScheduleView', function () {
  let page: RenderResult;
  describe('The Week View', function () {
    beforeEach(function () {
      page = render(
        <ScheduleView
          isPrefixActive={() => true}
          schedule={testCourseScheduleData}
          firstHour={8}
          lastHour={20}
        />
      );
    });
    it('Should render morning hours in am time', function () {
      const eleven = page.queryByText('11 AM');
      notStrictEqual(eleven, null);
    });
    it('Should render noon as 12pm', function () {
      const noon = page.queryByText('12 PM');
      notStrictEqual(noon, null);
    });
    it('Should render afternoon hours in pm time', function () {
      const one = page.queryByText('1 PM');
      notStrictEqual(one, null);
    });
    it('Should not render the final hour', function () {
      const two = page.queryByText('8 PM');
      strictEqual(two, null);
    });
  });
  describe('Rendering', function () {
    beforeEach(function () {
      page = render(
        <ScheduleView
          isPrefixActive={() => true}
          schedule={testCourseScheduleData}
          firstHour={8}
          lastHour={20}
        />
      );
    });
    it('Should render the blocks with the course prefix', function () {
      const prefixBlocks = page.getAllByRole('heading');
      const actualPrefixes = prefixBlocks.reduce<string[]>(
        (list, { tagName, textContent }) => {
          if (tagName === 'H4') {
            return [...list, textContent];
          }
          return list;
        }, []
      );
      const expectedPrefixes = testCourseScheduleData.map(
        ({ coursePrefix }) => coursePrefix
      );
      deepStrictEqual(actualPrefixes, expectedPrefixes);
    });
    it('Should render all of the courseNumbers in as buttons inside lists', function () {
      const expectedNumbers = testCourseScheduleData
        .reduce<string[]>((list, { courses }) => [
        ...list,
        ...courses.map(({ courseNumber }) => courseNumber),
      ],
      []);
      const actualNumbers = page.getAllByRole('listitem')
        .map((li) => li.firstChild.textContent);
      deepStrictEqual(actualNumbers, expectedNumbers);
    });
    describe('Popover details', function () {
      let testBlock: ScheduleViewResponseDTO;
      let testMeeting: ScheduleEntry;
      let meetingCount: Record<string, number>;
      beforeEach(function () {
        meetingCount = testCourseScheduleData.reduce((total, current) => {
          const count = { ...total };
          if (current.courses.length > 0) {
            current.courses.forEach(({ instanceId }) => {
              if (instanceId in count) {
                count[instanceId] += 1;
              } else {
                count[instanceId] = 1;
              }
            });
          }
          return count;
        }, {});
      });
      context('When clicking on a course with one entry', function () {
        beforeEach(function () {
          const [singleEntryInstanceId] = Object.entries(meetingCount)
            .find(([, count]) => count === 1);
          testBlock = testCourseScheduleData.find(
            ({ courses }) => courses.some(
              ({ instanceId }) => instanceId === singleEntryInstanceId
            )
          );
          testMeeting = testBlock.courses.find(
            ({ instanceId }) => instanceId === singleEntryInstanceId
          );
        });
        it('Should display the full course name', function () {
          const fullName = `${testBlock.coursePrefix} ${testMeeting.courseNumber}`;
          // first check that that the full name is not on the page
          const nameElement = page.queryByText(fullName);
          strictEqual(nameElement, null);
          const [testListButton] = page.getAllByText(testMeeting.courseNumber);
          fireEvent.click(testListButton);
          // Now make sure the full name is on the page
          return page.findByText(fullName);
        });
        it('Should display the day the meeting is held', function () {
          // first check that that the day name only appears once on the page
          // In the column header
          let dayName = page.queryAllByText(
            dayEnumToString(testBlock.weekday)
          );
          strictEqual(dayName.length, 1);
          const [testListButton] = page.getAllByText(testMeeting.courseNumber);
          fireEvent.click(testListButton);
          // Now make sure the room name is on the page
          dayName = page.queryAllByText(
            dayEnumToString(testBlock.weekday)
          );
          strictEqual(dayName.length, 2);
        });
        it('Should display the start and end time', function () {
          const {
            startHour,
            startMinute,
            endHour,
            endMinute,
          } = testBlock;
          // first check that that the full time is not on the page
          const displayStartTime = PGTime.toDisplay(
            `${startHour}:${startMinute.toString().padStart(2, '0')}`
          );
          const displayEndTime = PGTime.toDisplay(
            `${endHour}:${endMinute.toString().padStart(2, '0')}`
          );
          const timeElem = page.queryByText(`${displayStartTime} - ${displayEndTime}`);
          strictEqual(timeElem, null);
          const [testListButton] = page.getAllByText(testMeeting.courseNumber);
          fireEvent.click(testListButton);
          // Now make sure the room name is on the page
          return page.findByText(`${displayStartTime} - ${displayEndTime}`);
        });
        it('Should display the room name', function () {
          // first check that that the room name is not on the page
          const roomName = page.queryByText(testMeeting.room);
          strictEqual(roomName, null);
          const [testListButton] = page.getAllByText(testMeeting.courseNumber);
          fireEvent.click(testListButton);
          // Now make sure the room name is on the page
          return page.findByText(testMeeting.room);
        });
        context('When clicking elsewhere', function () {
          it('Should close the popover', function () {
            const [testListButton] = page.getAllByText(
              testMeeting.courseNumber
            );
            fireEvent.click(testListButton);
            // first check that that the room name is not on the page
            page.getByText(testMeeting.room);
            const heading = page.getByText(testBlock.coursePrefix);
            fireEvent.click(heading);
            // Now make sure that the room name is gone.
            const roomElem = page.queryByText(testMeeting.room);
            strictEqual(roomElem, null);
          });
        });
      });
      context('When clicking on a course with multiple entries', function () {
        let mutliEntryInstanceCount: number;
        beforeEach(function () {
          const [
            multiEntryInstanceId,
          ] = Object.entries(meetingCount)
            .find(([, count]) => count >= 1);
          testBlock = testCourseScheduleData.find(
            ({ courses }) => courses.some(
              ({ instanceId }) => instanceId === multiEntryInstanceId
            )
          );
          testMeeting = testBlock.courses.find(
            ({ instanceId }) => instanceId === multiEntryInstanceId
          );
          mutliEntryInstanceCount = meetingCount[multiEntryInstanceId];
        });
        it('Should include a course with multiple entries', function () {
          // Sanity check in case our underlying data changes
          notStrictEqual(mutliEntryInstanceCount, 0);
        });
        it('Should display the full course name in each block', async function () {
          const fullName = `${testBlock.coursePrefix} ${testMeeting.courseNumber}`;
          // first check that that the full name is not on the page
          const nameElement = page.queryByText(fullName);
          strictEqual(nameElement, null);
          const [testListButton] = page.getAllByText(testMeeting.courseNumber);
          fireEvent.click(testListButton);
          // Now make sure the full name is on the page
          const popups = await page.findAllByText(fullName);
          strictEqual(popups.length, mutliEntryInstanceCount);
        });
        it('Should display the day the meeting is held', function () {
          // first check that that the day name only appears once on the page
          // In the column header
          let dayName = page.queryAllByText(
            dayEnumToString(testBlock.weekday)
          );
          strictEqual(dayName.length, 1);
          const [testListButton] = page.getAllByText(testMeeting.courseNumber);
          fireEvent.click(testListButton);
          // Now make sure the room name is on the page
          dayName = page.queryAllByText(
            dayEnumToString(testBlock.weekday)
          );
          strictEqual(dayName.length, 2);
        });
        it('Should display the start and end time', function () {
          const {
            startHour,
            startMinute,
            endHour,
            endMinute,
          } = testBlock;
          // first check that that the full time is not on the page
          const displayStartTime = PGTime.toDisplay(
            `${startHour}:${startMinute.toString().padStart(2, '0')}`
          );
          const displayEndTime = PGTime.toDisplay(
            `${endHour}:${endMinute.toString().padStart(2, '0')}`
          );
          const timeElem = page.queryByText(`${displayStartTime} - ${displayEndTime}`);
          strictEqual(timeElem, null);
          const [testListButton] = page.getAllByText(testMeeting.courseNumber);
          fireEvent.click(testListButton);
          // Now make sure the room name is on the page
          return page.findAllByText(`${displayStartTime} - ${displayEndTime}`);
        });
        it('Should display the room name', function () {
          // first check that that the room name is not on the page
          const roomName = page.queryByText(testMeeting.room);
          strictEqual(roomName, null);
          const [testListButton] = page.getAllByText(testMeeting.courseNumber);
          fireEvent.click(testListButton);
          // Now make sure the room name is on the page
          return page.findAllByText(testMeeting.room);
        });
        context('When clicking elsewhere', function () {
          it('Should close the popover', function () {
            const [testListButton] = page.getAllByText(
              testMeeting.courseNumber
            );
            fireEvent.click(testListButton);
            // first check that that the room name is not on the page
            page.getAllByText(testMeeting.room);
            const [heading] = page.getAllByText(testBlock.coursePrefix);
            fireEvent.click(heading);
            // Now make sure that the room name is gone.
            const roomElem = page.queryAllByText(testMeeting.room);
            strictEqual(roomElem.length, 0);
          });
        });
      });
    });
    describe('Accessibility', function () {
      it('Should not include any active buttons on the page', function () {
        const buttonRoles = page.queryAllByRole('button');
        const activeButtons = buttonRoles.filter(
          (button) => !button.getAttribute('aria-disabled')
        );
        strictEqual(activeButtons.length, 0);
      });
      it('Should still display the Popover text for each entry', function () {
        testCourseScheduleData.forEach(({
          coursePrefix,
          weekday,
          startHour,
          startMinute,
          endHour,
          endMinute,
          courses,
        }) => {
          courses.forEach(({ courseNumber, room }) => {
            const day = dayEnumToString(weekday);
            const catalogNumber = `${coursePrefix} ${courseNumber}`;
            const displayStartTime = PGTime.toDisplay(
              `${startHour}:${startMinute.toString().padStart(2, '0')}`
            );
            const displayEndTime = PGTime.toDisplay(
              `${endHour}:${endMinute.toString().padStart(2, '0')}`
            );
            const accessibleText = `${catalogNumber} on ${day}, ${displayStartTime} to ${displayEndTime} in ${room}`;
            page.getByText(accessibleText);
          });
        });
      });
    });
  });
});
