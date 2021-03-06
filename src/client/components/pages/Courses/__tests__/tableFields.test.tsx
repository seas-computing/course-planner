import React, { FunctionComponent, ReactElement } from 'react';
import {
  cs50CourseInstance, ac209aCourseInstance, ac209aCourseInstanceWithoutRooms,
} from 'testData';
import { strictEqual, deepStrictEqual } from 'assert';
import {
  TERM, COURSE_TABLE_COLUMN, isSEASEnumToString, IS_SEAS,
} from 'common/constants';
import { render } from 'test-utils';
import { dayEnumToString } from 'common/constants/day';
import { offeredEnumToString } from 'common/constants/offered';
import {
  retrieveValue, tableFields, formatInstructors, formatMeetings,
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
        const getValueFall = retrieveValue('actualEnrollment', TERM.FALL);
        const getValueSpring = retrieveValue('actualEnrollment', TERM.SPRING);
        strictEqual(
          getValueFall(cs50CourseInstance),
          cs50CourseInstance.fall.actualEnrollment
        );
        strictEqual(
          getValueSpring(cs50CourseInstance),
          cs50CourseInstance.spring.actualEnrollment
        );
      });
      it('should return a function that converts true booleans to "Yes"', function () {
        const getBooleanValue = retrieveValue('isUndergraduate');
        strictEqual(
          getBooleanValue({ ...cs50CourseInstance, isUndergraduate: true }),
          'Yes'
        );
      });
      it('should return a function that converts false booleans to "No"', function () {
        const getBooleanValue = retrieveValue('isUndergraduate');
        strictEqual(
          getBooleanValue({ ...cs50CourseInstance, isUndergraduate: false }),
          'No'
        );
      });
      it('Should return a function that converts OFFERED values to strings', function () {
        const getValueFall = retrieveValue('offered', TERM.FALL);
        strictEqual(
          getValueFall(cs50CourseInstance),
          offeredEnumToString(cs50CourseInstance.fall.offered)
        );
      });
      it('Should return a function that converts IS_SEAS.Y to "Yes"', function () {
        const getIsSEASValue = retrieveValue('isSEAS');
        strictEqual(
          getIsSEASValue({
            ...cs50CourseInstance,
            isSEAS: IS_SEAS.Y,
          }),
          isSEASEnumToString(IS_SEAS.Y)
        );
      });
      it('Should return a function that converts IS_SEAS.N to "No"', function () {
        const getIsSEASValue = retrieveValue('isSEAS');
        strictEqual(
          getIsSEASValue({
            ...cs50CourseInstance,
            isSEAS: IS_SEAS.N,
          }),
          isSEASEnumToString(IS_SEAS.N)
        );
      });
      it('Should return a function that converts IS_SEAS.EPS to "EPS"', function () {
        const getIsSEASValue = retrieveValue('isSEAS');
        strictEqual(
          getIsSEASValue({
            ...cs50CourseInstance,
            isSEAS: IS_SEAS.EPS,
          }),
          isSEASEnumToString(IS_SEAS.EPS)
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
            </div>
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
    describe('formatMeetings', function () {
      context('When semester has data', function () {
        context('With times and rooms', function () {
          it('Should return a component that renders days, times and rooms as a list', function () {
            const fallMeetings = formatMeetings(TERM.FALL);
            const TestComponent: FunctionComponent = (): ReactElement => (
              <div>
                {fallMeetings(ac209aCourseInstance)}
              </div>
            );
            const { getAllByRole } = render(
              <TestComponent />
            );
            const entries = getAllByRole('listitem')
              .map(({ textContent }): string => textContent);
            const timesList = ac209aCourseInstance.fall.meetings
              .map(({
                day, startTime, endTime, room,
              }): string => (
                `${dayEnumToString(day)}${startTime}-${endTime}${room.name}${room.campus}`));
            deepStrictEqual(entries, timesList);
          });
        });
        context('With times but not rooms', function () {
          it('Should return a component that renders just days and times as a list', function () {
            const fallMeetings = formatMeetings(TERM.FALL);
            const TestComponent: FunctionComponent = (): ReactElement => (
              <div>
                {fallMeetings(ac209aCourseInstanceWithoutRooms)}
              </div>
            );
            const { getAllByRole } = render(
              <TestComponent />
            );
            const entries = getAllByRole('listitem')
              .map(({ textContent }): string => textContent);
            const timesList = ac209aCourseInstance.fall.meetings
              .map(({ day, startTime, endTime }): string => (
                `${dayEnumToString(day)}${startTime}-${endTime}`));
            deepStrictEqual(entries, timesList);
          });
        });
      });
      context('When semester does not have data', function () {
        it('Should return null', function () {
          const springTimes = formatMeetings(TERM.SPRING);
          const TestComponent: FunctionComponent = (): ReactElement => (
            <div>
              {springTimes(ac209aCourseInstance)}
            </div>
          );
          render(
            <TestComponent />
          );
          strictEqual(document.body.textContent, '');
        });
      });
    });
    describe('Notes field', function () {
      context('Course with Notes', function () {
        it('renders a button to view/edit notes', function () {
          const notesField = tableFields.find(({ viewColumn }): boolean => (
            viewColumn === COURSE_TABLE_COLUMN.NOTES));
          const { queryByLabelText } = render(
            <div>
              {notesField.getValue(ac209aCourseInstance)}
            </div>
          );
          const icon = queryByLabelText('View/Edit Notes');
          strictEqual(icon !== null, true);
        });
      });
      context('Course without notes', function () {
        it('renders a button to add notes', function () {
          const notesField = tableFields.find(({ viewColumn }): boolean => (
            viewColumn === COURSE_TABLE_COLUMN.NOTES));
          const { queryByLabelText } = render(
            <div>
              {notesField.getValue(cs50CourseInstance)}
            </div>
          );
          const icon = queryByLabelText('Add Notes');
          strictEqual(icon !== null, true);
        });
      });
    });
  });
});
