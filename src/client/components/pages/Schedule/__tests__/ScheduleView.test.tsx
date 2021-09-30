import React from 'react';
import {
  render,
  BoundFunction,
  QueryByText,
  AllByRole,
} from 'test-utils';
import { testCourseScheduleData } from 'testData';
import { notStrictEqual, strictEqual, deepStrictEqual } from 'assert';
import ScheduleView from '../ScheduleView';

describe('ScheduleView', function () {
  let queryByText: BoundFunction<QueryByText>;
  let getAllByRole: BoundFunction<AllByRole>;
  describe('The Week View', function () {
    beforeEach(function () {
      ({ queryByText } = render(
        <ScheduleView
          schedule={testCourseScheduleData}
          firstHour={8}
          lastHour={20}
        />
      ));
    });
    it('Should render morning hours in am time', function () {
      const eleven = queryByText('11 AM');
      notStrictEqual(eleven, null);
    });
    it('Should render noon as 12pm', function () {
      const noon = queryByText('12 PM');
      notStrictEqual(noon, null);
    });
    it('Should render afternoon hours in pm time', function () {
      const one = queryByText('1 PM');
      notStrictEqual(one, null);
    });
    it('Should not render the final hour', function () {
      const two = queryByText('8 PM');
      strictEqual(two, null);
    });
  });
  describe('Rendering', function () {
    beforeEach(function () {
      ({ getAllByRole } = render(
        <ScheduleView
          schedule={testCourseScheduleData}
          firstHour={8}
          lastHour={20}
        />
      ));
    });
    it('Should render the blocks with the course prefix', function () {
      const prefixBlocks = getAllByRole('heading');
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
    it('Should render all of the courseNumbers in lists', function () {
      const actualNumbers = getAllByRole('listitem')
        .map(({ textContent }) => textContent);
      const expectedNumbers = testCourseScheduleData
        .reduce<string[]>((list, { courses }) => [
        ...list,
        ...courses.map(({ courseNumber }) => courseNumber),
      ],
      []);
      deepStrictEqual(actualNumbers, expectedNumbers);
    });
  });
});
