import React from 'react';
import { strictEqual, deepStrictEqual, notStrictEqual } from 'assert';
import {
  render,
  BoundFunction,
  AllByRole,
  getRoles,
  within,
  fireEvent,
} from 'test-utils';
import { spy, SinonSpy } from 'sinon';
import { cs50CourseInstance, es095CourseInstance } from 'testData';
import { COURSE_TABLE_COLUMN, isSEASEnumToString, IS_SEAS } from 'common/constants';
import OFFERED, { offeredEnumToString } from 'common/constants/offered';
import CourseInstanceTable from '../CourseInstanceTable';
import { tableFields } from '../tableFields';
import * as filters from '../../Filter';

describe('CourseInstanceTable', function () {
  let updateSpy: SinonSpy;
  let filterSpy: SinonSpy;
  const academicYear = 2020;
  const courseList = [
    cs50CourseInstance,
    es095CourseInstance,
  ];
  beforeEach(function () {
    updateSpy = spy();
    filterSpy = spy(filters, 'listFilter');
  });
  describe('Header rows', function () {
    context('With all fields visible', function () {
      const testView = [
        COURSE_TABLE_COLUMN.AREA,
        COURSE_TABLE_COLUMN.CATALOG_NUMBER,
        COURSE_TABLE_COLUMN.TITLE,
        COURSE_TABLE_COLUMN.SAME_AS,
        COURSE_TABLE_COLUMN.IS_SEAS,
        COURSE_TABLE_COLUMN.IS_UNDERGRADUATE,
        COURSE_TABLE_COLUMN.OFFERED,
        COURSE_TABLE_COLUMN.INSTRUCTORS,
        COURSE_TABLE_COLUMN.MEETINGS,
        COURSE_TABLE_COLUMN.ENROLLMENT,
        COURSE_TABLE_COLUMN.NOTES,
        COURSE_TABLE_COLUMN.DETAILS,
      ];
      let getAllByRole: BoundFunction<AllByRole>;
      const areaFilterLabel = 'The table will be filtered as selected in this area dropdown filter';
      const isSEASFilterLabel = 'The table will be filtered as selected in this Is SEAS dropdown filter';
      const fallOfferedFilterLabel = 'The table will be filtered as selected in this fall offered dropdown filter';
      const springOfferedFilterLabel = 'The table will be filtered as selected in this spring offered dropdown filter';
      beforeEach(function () {
        ({ getAllByRole } = render(
          <CourseInstanceTable
            academicYear={academicYear}
            courseList={courseList}
            courseUpdateHandler={updateSpy}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
          />
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
          elem.textContent === 'Enrollment'
        ));
        notStrictEqual(enrollment, null);
      });
      it('renders the individual enrollment values into the third row', function () {
        const [, , thirdRow] = getAllByRole('row');
        const { columnheader } = getRoles(thirdRow);
        const preHeaders = columnheader.filter((elem) => (
          elem.textContent === 'Pre'
        ));
        const studyHeaders = columnheader.filter((elem) => (
          elem.textContent === 'Study'
        ));
        const actualHeaders = columnheader.filter((elem) => (
          elem.textContent === 'Actual'
        ));
        strictEqual(preHeaders.length, 2, 'Incorrect number of "Pre" columns');
        strictEqual(studyHeaders.length, 2, 'Incorrect number of "Study" columns');
        strictEqual(actualHeaders.length, 2, 'Incorrect number of "Actual" columns');
      });
      it('renders the filters in the third row', function () {
        const [, , thirdRow] = getAllByRole('row');
        const utils = within(thirdRow);
        const areaFilter = utils.getAllByLabelText(areaFilterLabel);
        const isSEASFilter = utils.getAllByLabelText(isSEASFilterLabel);
        const fallOfferedFilter = utils
          .getAllByLabelText(fallOfferedFilterLabel);
        const springOfferedFilter = utils
          .getAllByLabelText(springOfferedFilterLabel);
        strictEqual(areaFilter.length, 1, 'Error with area filter rendering');
        strictEqual(isSEASFilter.length, 1, 'Error with isSEAS filter rendering');
        strictEqual(fallOfferedFilter.length, 1, 'Error with fall offered filter rendering');
        strictEqual(springOfferedFilter.length, 1, 'Error with spring offered filter rendering');
      });
      context('when the area dropdown filter is changed', function () {
        it('calls the listFilter function once for each filter', function () {
          const [, , thirdRow] = getAllByRole('row');
          const utils = within(thirdRow);
          const area = utils.getByLabelText(areaFilterLabel);
          filterSpy.resetHistory();
          fireEvent.change(area, { target: { value: 'AM' } });
          strictEqual(filterSpy.callCount, 1);
        });
      });
      context('when the isSEAS dropdown filter is called', function () {
        it('calls the listFilter function once for each filter', function () {
          const [, , thirdRow] = getAllByRole('row');
          const utils = within(thirdRow);
          const isSEAS = utils.getByLabelText(isSEASFilterLabel);
          filterSpy.resetHistory();
          fireEvent.change(isSEAS,
            { target: { value: isSEASEnumToString(IS_SEAS.N) } });
          strictEqual(filterSpy.callCount, 1);
        });
      });
      context('when the fall offered dropdown filter is called', function () {
        it('calls the listFilter function once for each filter', function () {
          const [, , thirdRow] = getAllByRole('row');
          const utils = within(thirdRow);
          const fallOffered = utils.getByLabelText(fallOfferedFilterLabel);
          filterSpy.resetHistory();
          fireEvent.change(fallOffered,
            { target: { value: offeredEnumToString(OFFERED.Y) } });
          strictEqual(filterSpy.callCount, 1);
        });
      });
      context('when the spring offered dropdown filter is called', function () {
        it('calls the listFilter function once for each filter', function () {
          const [, , thirdRow] = getAllByRole('row');
          const utils = within(thirdRow);
          const springOffered = utils.getByLabelText(springOfferedFilterLabel);
          filterSpy.resetHistory();
          fireEvent.change(springOffered,
            { target: { value: offeredEnumToString(OFFERED.N) } });
          strictEqual(filterSpy.callCount, 1);
        });
      });
    });
    context('With no semester fields visible', function () {
      const testView = [
        COURSE_TABLE_COLUMN.AREA,
        COURSE_TABLE_COLUMN.CATALOG_NUMBER,
        COURSE_TABLE_COLUMN.DETAILS,
      ];
      let getAllByRole: BoundFunction<AllByRole>;
      beforeEach(function () {
        ({ getAllByRole } = render(
          <CourseInstanceTable
            academicYear={academicYear}
            courseList={courseList}
            courseUpdateHandler={updateSpy}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
          />
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
        COURSE_TABLE_COLUMN.AREA,
        COURSE_TABLE_COLUMN.CATALOG_NUMBER,
        COURSE_TABLE_COLUMN.INSTRUCTORS,
        COURSE_TABLE_COLUMN.DETAILS,
      ];
      let getAllByRole: BoundFunction<AllByRole>;
      beforeEach(function () {
        ({ getAllByRole } = render(
          <CourseInstanceTable
            academicYear={academicYear}
            courseUpdateHandler={updateSpy}
            courseList={courseList}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
          />
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
      COURSE_TABLE_COLUMN.AREA,
      COURSE_TABLE_COLUMN.CATALOG_NUMBER,
      COURSE_TABLE_COLUMN.TITLE,
      COURSE_TABLE_COLUMN.SAME_AS,
      COURSE_TABLE_COLUMN.IS_SEAS,
      COURSE_TABLE_COLUMN.IS_UNDERGRADUATE,
      COURSE_TABLE_COLUMN.OFFERED,
      COURSE_TABLE_COLUMN.INSTRUCTORS,
      COURSE_TABLE_COLUMN.MEETINGS,
      COURSE_TABLE_COLUMN.ENROLLMENT,
      COURSE_TABLE_COLUMN.NOTES,
      COURSE_TABLE_COLUMN.DETAILS,
    ];
    let getAllByRole: BoundFunction<AllByRole>;
    beforeEach(function () {
      ({ getAllByRole } = render(
        <CourseInstanceTable
          academicYear={academicYear}
          courseList={courseList}
          courseUpdateHandler={updateSpy}
          tableData={tableFields.filter(
            ({ viewColumn }): boolean => (
              testView.includes(viewColumn)
            )
          )}
        />
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
