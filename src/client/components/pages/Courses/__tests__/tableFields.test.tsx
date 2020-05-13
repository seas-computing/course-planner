import React from 'react';
import {
  cs50CourseInstance, ac209aCourseInstance,
} from 'testData';
import { strictEqual, deepStrictEqual } from 'assert';
import { TERM } from 'common/constants';
import { render } from 'test-utils';
import {
  retrieveValue, tableFields, formatInstructors, formatTimes, formatRooms,
} from '../tableFields';

describe('tableFields', function () {
  describe('helper functions', function () {
    describe('retrieveValue', function () {
      it('should return a function to get course-level fields', function () {
        const getValue = retrieveValue('catalogNumber');
        strictEqual(
          getValue(cs50CourseInstance),
          cs50CourseInstance.catalogNumber
        );
      });
      it('Should return a function to get a semester level field', function () {
        const getValueFall = retrieveValue('offered', TERM.FALL);
        const getValueSpring = retrieveValue('offered', TERM.SPRING);
        strictEqual(
          getValueFall(cs50CourseInstance),
          cs50CourseInstance.fall.offered
        );
        strictEqual(
          getValueSpring(cs50CourseInstance),
          cs50CourseInstance.spring.offered
        );
      });
      it('should return a function that converts true booleans to "Yes"', function () {
        const getBooleanValue = retrieveValue('isSEAS');
        strictEqual(
          getBooleanValue({ ...cs50CourseInstance, isSEAS: true }),
          'Yes'
        );
      });
      it('should return a function that converts false booleans to "No"', function () {
        const getBooleanValue = retrieveValue('isSEAS');
        strictEqual(
          getBooleanValue({ ...cs50CourseInstance, isSEAS: false }),
          'No'
        );
      });
    });
    describe('formatInstructors', function () {
      context('When course has data', function () {
        it('Should return a component that renders instructors as a list', function () {
          const fallInstructors = formatInstructors(TERM.FALL);
          const { getAllByRole } = render(
            <div>
              {fallInstructors(ac209aCourseInstance)}
            </div>,
            (): void => {}
          );
          const entries = getAllByRole('listitem')
            .map(({ textContent }): string => textContent);
          const instructorList = ac209aCourseInstance.fall.instructors
            .map(({ displayName }): string => displayName);
          deepStrictEqual(entries, instructorList);
        });
      });
      context('When semester does not have data', function () {
        it('Should return null', function () {
          const springInstructors = formatInstructors(TERM.SPRING);
          strictEqual(
            springInstructors(ac209aCourseInstance),
            null
          );
        });
      });
    });
    describe('formatTimes', function () {
      context('When semester has data', function () {
        it('Should return a component that renders days/times as a list', function () {
          const fallTimes = formatTimes(TERM.FALL);
          const { getAllByRole } = render(
            <div>
              {fallTimes(ac209aCourseInstance)}
            </div>,
            (): void => {}
          );
          const entries = getAllByRole('listitem')
            .map(({ textContent }): string => textContent);
          const timesList = ac209aCourseInstance.fall.meetings
            .map(({ day, startTime, endTime }): string => (
              `${day}: ${startTime}-${endTime}`));
          deepStrictEqual(entries, timesList);
        });
      });
      context('When semester does not have data', function () {
        it('Should return null', function () {
          const springTimes = formatTimes(TERM.SPRING);
          strictEqual(springTimes(ac209aCourseInstance), null);
        });
      });
    });
    describe('formatRooms', function () {
      context('When semester has data', function () {
        it('Should return a component that renders rooms as a list', function () {
          const fallRooms = formatRooms(TERM.FALL);
          const { getAllByRole } = render(
            <div>
              {fallRooms(ac209aCourseInstance)}
            </div>,
            (): void => {}
          );
          const entries = getAllByRole('listitem')
            .map(({ textContent }): string => textContent);
          const roomsList = ac209aCourseInstance.fall.meetings
            .map(({ room }): string => room.name);
          deepStrictEqual(entries, roomsList);
        });
      });
      context('When semester does not have data', function () {
        it('Should return null', function () {
          const springRooms = formatRooms(TERM.SPRING);
          strictEqual(springRooms(ac209aCourseInstance), null);
        });
      });
    });
  });
  describe('Notes field', function () {
    context('Course with Notes', function () {
      it('renders a button to view/edit notes', function () {
        const notesField = tableFields.find(({ viewColumn }): boolean => (
          viewColumn === 'notes'));
        const { queryByLabelText } = render(
          <div>
            {notesField.getValue(ac209aCourseInstance)}
          </div>,
          (): void => {}
        );
        const icon = queryByLabelText('View/Edit Notes');
        strictEqual(icon !== null, true);
      });
    });
    context('Course without notes', function () {
      it('renders a button to add notes', function () {
        const notesField = tableFields.find(({ viewColumn }): boolean => (
          viewColumn === 'notes'));
        const { queryByLabelText } = render(
          <div>
            {notesField.getValue(cs50CourseInstance)}
          </div>,
          (): void => {}
        );
        const icon = queryByLabelText('Add Notes');
        strictEqual(icon !== null, true);
      });
    });
  });
});
