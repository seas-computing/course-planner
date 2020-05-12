import React from 'react';
import { strictEqual, deepStrictEqual, notStrictEqual } from 'assert';
import {
  render, BoundFunction, AllByRole, getRoles,
} from 'test-utils';
import { cs50CourseInstance, es095CourseInstance } from 'testData';
import CourseInstanceTable from '../CourseInstanceTable';
import { tableFields } from '../tableFields';

describe.only('CourseInstanceTable', function () {
  const academicYear = 2020;
  const courseList = [
    cs50CourseInstance,
    es095CourseInstance,
  ];
  describe('Header rows', function () {
    context('With all fields visible', function () {
      const testView = [
        'area',
        'catalogNumber',
        'title',
        'sameAs',
        'isSEAS',
        'isUndergraduate',
        'offered',
        'instructors',
        'times',
        'rooms',
        'enrollment',
        'notes',
        'details',
      ];
      let getAllByRole: BoundFunction<AllByRole>;
      beforeEach(function () {
        ({ getAllByRole } = render(
          <CourseInstanceTable
            academicYear={academicYear}
            courseList={courseList}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
          />,
          (): void => {}
        )
        );
      });
      it('Renders three rows of headers', function () {
        const allRows = getAllByRole('row');
        const headerRows = allRows.filter((row) => {
          const roles = getRoles(row);
          return 'columnheader' in roles && roles.columnheader.length > 0;
        });
        strictEqual(headerRows.length, 3);
      });
      it('Renders the semesters into the top header row', function () {
        const [topRow] = getAllByRole('row');
        const { columnheader: [fallHeader, springHeader] } = getRoles(topRow);
        strictEqual(fallHeader.textContent, `Fall ${academicYear - 1}`);
        strictEqual(springHeader.textContent, `Spring ${academicYear}`);
      });
      it('Renders the Enrollment header into the second row', function () {
        const [, secondRow] = getAllByRole('row');
        const { columnheader } = getRoles(secondRow);
        const enrollment = columnheader.find((elem) => (
          elem.textContent === 'enrollment'
        ));
        notStrictEqual(enrollment, null);
      });
      it('renders the individual enrollment values into the third row', function () {
        const [, , thirdRow] = getAllByRole('row');
        const { columnheader } = getRoles(thirdRow);
        const enrollmentValues = columnheader.map((elem) => (
          elem.textContent
        ));
        deepStrictEqual(
          enrollmentValues,
          ['Pre', 'Study', 'Actual', 'Pre', 'Study', 'Actual']
        );
      });
    });
    context('With no semester of fields visible', function () {
      const testView = [
        'area',
        'catalogNumber',
        'details',
      ];
      let getAllByRole: BoundFunction<AllByRole>;
      beforeEach(function () {
        ({ getAllByRole } = render(
          <CourseInstanceTable
            academicYear={academicYear}
            courseList={courseList}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
          />,
          (): void => {}
        )
        );
      });
      it('Only renders one row of headers', function () {
        const allRows = getAllByRole('row');
        const headerRows = allRows.filter((row) => {
          const roles = getRoles(row);
          return 'columnheader' in roles && roles.columnheader.length > 0;
        });
        strictEqual(headerRows.length, 1);
      });
      it('Only includes the specified titles', function () {
        const [firstRow] = getAllByRole('row');
        const { columnheader } = getRoles(firstRow);
        const titles = columnheader.map((elem) => (elem.textContent));
        deepStrictEqual(titles, ['Area', 'Course', 'Details']);
      });
    });
    context('With semesters, but no enrollment data visible', function () {
      const testView = [
        'area',
        'catalogNumber',
        'instructors',
        'details',
      ];
      let getAllByRole: BoundFunction<AllByRole>;
      beforeEach(function () {
        ({ getAllByRole } = render(
          <CourseInstanceTable
            academicYear={academicYear}
            courseList={courseList}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
          />,
          (): void => {}
        )
        );
      });
      it('Only renders two rows of headers', function () {
        const allRows = getAllByRole('row');
        const headerRows = allRows.filter((row) => {
          const roles = getRoles(row);
          return 'columnheader' in roles && roles.columnheader.length > 0;
        });
        strictEqual(headerRows.length, 2);
      });
      it('Renders the semesters into the top header row', function () {
        const [topRow] = getAllByRole('row');
        const { columnheader: [fallHeader, springHeader] } = getRoles(topRow);
        strictEqual(fallHeader.textContent, `Fall ${academicYear - 1}`);
        strictEqual(springHeader.textContent, `Spring ${academicYear}`);
      });
      it('Only includes the specified titles', function () {
        const [, secondRow] = getAllByRole('row');
        const { columnheader } = getRoles(secondRow);
        const titles = columnheader.map((elem) => (elem.textContent));
        deepStrictEqual(titles, ['Area', 'Course', 'Instructors', 'Instructors', 'Details']);
      });
    });
  });
  describe('Table body', function () {
    const testView = [
      'area',
      'catalogNumber',
      'title',
      'sameAs',
      'isSEAS',
      'isUndergraduate',
      'offered',
      'instructors',
      'times',
      'rooms',
      'enrollment',
      'notes',
      'details',
    ];
    let getAllByRole: BoundFunction<AllByRole>;
    beforeEach(function () {
      ({ getAllByRole } = render(
        <CourseInstanceTable
          academicYear={academicYear}
          courseList={courseList}
          tableData={tableFields.filter(
            ({ viewColumn }): boolean => (
              testView.includes(viewColumn)
            )
          )}
        />,
        (): void => {}
      )
      );
    });
    it('renders the courses into the body', function () {
      const allRows = getAllByRole('row');
      const headerRows = allRows.filter((row) => {
        const roles = getRoles(row);
        return !('columnheader' in roles && roles.columnheader.length > 0);
      });
      strictEqual(headerRows.length, courseList.length);
    });
    it('renders the catalogNumber as the rowheader', function () {
      const rowHeaders = getAllByRole('rowheader');
      const rowHeaderText = rowHeaders.map(({ textContent }) => textContent);
      const courseTitles = courseList.map(({ catalogNumber }) => catalogNumber);
      deepStrictEqual(rowHeaderText, courseTitles);
    });
  });
});
