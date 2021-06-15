import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  waitForElement,
  wait,
  within,
  fireEvent,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
  SinonSpy,
  spy,
} from 'sinon';
import { CourseAPI } from 'client/api/courses';
import {
  computerScienceCourseResponse,
  physicsCourseResponse,
  newAreaCourseResponse,
  error,
} from 'testData';
import { render } from 'test-utils';
import CourseAdmin from '../CourseAdmin';
import * as filters from '../Filter';

describe('Course Admin', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  let filterSpy: SinonSpy;
  const testData = [
    computerScienceCourseResponse,
    physicsCourseResponse,
    newAreaCourseResponse,
  ];
  const areaLabelText = 'The table will be filtered as selected in this area dropdown filter';
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getAllCourses');
    getStub.resolves(testData);
    filterSpy = spy(filters, 'listFilter');
    dispatchMessage = stub();
  });
  describe('rendering', function () {
    it('creates a table', async function () {
      const { container } = render(
        <CourseAdmin />
      );
      return waitForElement(() => container.querySelector('.course-admin-table'));
    });
    it('displays the "create course" button', async function () {
      const { container } = render(
        <CourseAdmin />
      );
      return waitForElement(() => container.querySelector('.create-course-button'));
    });
    context('when course data fetch succeeds', function () {
      it('displays the correct course information', async function () {
        const { getByText } = render(
          <CourseAdmin />
        );
        strictEqual(getStub.callCount, 1);
        const { title } = computerScienceCourseResponse;
        return waitForElement(() => getByText(title));
      });
      it('display the filters in the first row', async function () {
        const { getAllByRole } = render(
          <CourseAdmin />
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        const utils = within(rows[1]);
        const area = utils.getAllByLabelText(areaLabelText);
        const course = utils.getAllByPlaceholderText('Filter by Course');
        const title = utils.getAllByPlaceholderText('Filter by Title');
        strictEqual(area.length, 1);
        strictEqual(course.length, 1);
        strictEqual(title.length, 1);
      });
      it('displays the correct number of rows in the table', async function () {
        const { getAllByRole } = render(
          <CourseAdmin />
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        strictEqual(rows.length, testData.length + 2);
      });
      it('displays the correct content in the table cells', async function () {
        const { getAllByRole } = render(
          <CourseAdmin />
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
        const rowsContent = rows
          .map((x) => (Array.from(x.cells).map((y) => y.textContent)));
        const computerScienceCourseCatalogNumber = rowsContent[2][1];
        const computerScienceCourseTitle = rowsContent[2][2];
        const physicsCourseCatalogNumber = rowsContent[3][1];
        const physicsCourseTitle = rowsContent[3][2];
        strictEqual(
          computerScienceCourseCatalogNumber,
          computerScienceCourseResponse.catalogNumber
        );
        strictEqual(
          computerScienceCourseTitle,
          computerScienceCourseResponse.title
        );
        strictEqual(
          physicsCourseCatalogNumber,
          physicsCourseResponse.catalogNumber
        );
        strictEqual(
          physicsCourseTitle,
          physicsCourseResponse.title
        );
      });
      it('does not pass the backgroundColor prop when area does not exist', async function () {
        const { getAllByRole, getByText } = render(
          <CourseAdmin />
        );
        await wait(() => getAllByRole('row').length > 1);
        const newAreaCourseStyle = window.getComputedStyle(getByText('NA', { selector: 'td' }));
        strictEqual(newAreaCourseStyle.backgroundColor, '');
      });
      context('when the the dropdown and the text input filters called', function () {
        it('Calls the listFilter function once for each filter', async function () {
          const { getAllByRole } = render(
            <CourseAdmin />
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const area = utils.queryByLabelText(areaLabelText);
          filterSpy.resetHistory();
          fireEvent.change(area, { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 3);
        });
        it('Calls the listFilter function once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <CourseAdmin />
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const area = utils.queryByLabelText(areaLabelText);
          filterSpy.resetHistory();
          fireEvent.change(area, { target: { value: 'All' } });
          strictEqual(filterSpy.callCount, 2);
        });
        it('Calls the listFilter function once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <CourseAdmin />
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const course = utils.getAllByPlaceholderText('Filter by Course') as HTMLSelectElement[];
          filterSpy.resetHistory();
          fireEvent.change(course[0], { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 2);
        });
        it('Calls the listFilter function once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <CourseAdmin />
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const title = utils.getAllByPlaceholderText('Filter by Title') as HTMLTableRowElement[];
          filterSpy.resetHistory();
          fireEvent.change(title[0], { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 2);
        });
      });
      context('when there are no course records', function () {
        const emptyTestData = [];
        beforeEach(function () {
          getStub.resolves(emptyTestData);
        });
        it('displays the correct number of rows in the table (only the header row)', async function () {
          const { getAllByRole } = render(
            <CourseAdmin />
          );
          await wait(() => getAllByRole('row').length > 0);
          const rows = getAllByRole('row');
          strictEqual(rows.length, emptyTestData.length + 2);
        });
      });
    });
    context('when course data fetch fails', function () {
      beforeEach(function () {
        getStub.rejects(error);
      });
      it('should throw an error', async function () {
        const { getAllByRole } = render(
          <CourseAdmin />,
          { dispatchMessage }
        );
        await wait(() => getAllByRole('row').length > 0);
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
