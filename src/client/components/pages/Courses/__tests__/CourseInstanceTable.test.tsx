import React from 'react';
import { strictEqual, deepStrictEqual, notStrictEqual } from 'assert';
import {
  render,
  BoundFunction,
  AllByRole,
  getRoles,
  within,
} from 'test-utils';
import { spy, SinonSpy } from 'sinon';
import { cs50CourseInstance, es095CourseInstance } from 'testData';
import { COURSE_TABLE_COLUMN } from 'common/constants';
import CourseInstanceTable from '../CourseInstanceTable';
import { tableFields } from '../tableFields';
import { FilterState } from '../filters.d';

describe('CourseInstanceTable', function () {
  let updateSpy: SinonSpy;
  let openMeetingModalSpy: SinonSpy;
  let openInstructorModalSpy: SinonSpy;
  const academicYear = 2020;
  const courseList = [
    cs50CourseInstance,
    es095CourseInstance,
  ];
  const testFilters: FilterState = {
    area: 'All',
    catalogNumber: '',
    title: '',
    isSEAS: 'All',
    spring: {
      offered: 'All',
      instructors: '',
    },
    fall: {
      offered: 'All',
      instructors: '',
    },
  };
  beforeEach(function () {
    updateSpy = spy();
    openMeetingModalSpy = spy();
    openInstructorModalSpy = spy();
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
      const isSEASFilterLabel = 'The table will be filtered as selected in this isSEAS dropdown filter';
      const fallOfferedFilterLabel = 'The table will be filtered as selected in this fall offered dropdown filter';
      const springOfferedFilterLabel = 'The table will be filtered as selected in this spring offered dropdown filter';
      beforeEach(function () {
        ({ getAllByRole } = render(
          <CourseInstanceTable
            academicYear={academicYear}
            courseList={courseList}
            genericFilterUpdate={updateSpy}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
            filters={testFilters}
            openMeetingModal={openMeetingModalSpy}
            openInstructorModal={openInstructorModalSpy}
            buttonRef={null}
            modalButtonId=""
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
            genericFilterUpdate={updateSpy}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
            filters={testFilters}
            openMeetingModal={openMeetingModalSpy}
            openInstructorModal={openInstructorModalSpy}
            buttonRef={null}
            modalButtonId=""
          />
        )
        );
      });
      it('renders two rows of headers', function () {
        const allRows = getAllByRole('row');
        const headerRows = allRows.filter((row) => {
          const roles = getRoles(row);
          return 'columnheader' in roles && roles.columnheader.length > 0;
        });
        strictEqual(headerRows.length, 2);
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
            genericFilterUpdate={updateSpy}
            courseList={courseList}
            tableData={tableFields.filter(
              ({ viewColumn }): boolean => (
                testView.includes(viewColumn)
              )
            )}
            filters={testFilters}
            openMeetingModal={openMeetingModalSpy}
            openInstructorModal={openInstructorModalSpy}
            buttonRef={null}
            modalButtonId=""
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
          genericFilterUpdate={updateSpy}
          tableData={tableFields.filter(
            ({ viewColumn }): boolean => (
              testView.includes(viewColumn)
            )
          )}
          filters={testFilters}
          openMeetingModal={openMeetingModalSpy}
          openInstructorModal={openInstructorModalSpy}
          buttonRef={null}
          modalButtonId=""
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
