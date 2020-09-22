import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  waitForElement,
  wait,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import { CourseAPI } from 'client/api/courses';
import {
  computerScienceCourseResponse,
  physicsCourseResponse,
  newAreaCourseResponse,
  error,
  metadata,
} from 'testData';
import { render } from 'test-utils';
import CourseAdmin from '../CourseAdmin';

describe('Course Admin', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  const testData = [
    computerScienceCourseResponse,
    physicsCourseResponse,
    newAreaCourseResponse,
  ];
  beforeEach(function () {
    getStub = stub(CourseAPI, 'getAllCourses');
    getStub.resolves(testData);
    dispatchMessage = stub();
  });
  describe('rendering', function () {
    it('creates a table', async function () {
      const { container } = render(
        <CourseAdmin />,
        dispatchMessage,
        metadata
      );
      return waitForElement(() => container.querySelector('.course-admin-table'));
    });
    context('when course data fetch succeeds', function () {
      it('displays the correct course information', async function () {
        const { getByText } = render(
          <CourseAdmin />,
          dispatchMessage,
          metadata
        );
        strictEqual(getStub.callCount, 1);
        const { title } = computerScienceCourseResponse;
        return waitForElement(() => getByText(title));
      });
      it('displays the correct number of rows in the table', async function () {
        const { getAllByRole } = render(
          <CourseAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        strictEqual(rows.length, testData.length + 1);
      });
      it('displays the correct content in the table cells', async function () {
        const { getAllByRole } = render(
          <CourseAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
        const rowsContent = rows
          .map((x) => (Array.from(x.cells).map((y) => y.textContent)));
        const computerScienceCourseCatalogNumber = rowsContent[1][1];
        const computerScienceCourseTitle = rowsContent[1][2];
        const physicsCourseCatalogNumber = rowsContent[2][1];
        const physicsCourseTitle = rowsContent[2][2];
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
          <CourseAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 1);
        const newAreaCourseStyle = window.getComputedStyle(getByText('NA'));
        strictEqual(newAreaCourseStyle.backgroundColor, '');
      });
      context('when there are no course records', function () {
        const emptyTestData = [];
        beforeEach(function () {
          getStub.resolves(emptyTestData);
        });
        it('displays the correct number of rows in the table (only the header row)', async function () {
          const { getAllByRole } = render(
            <CourseAdmin />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 0);
          const rows = getAllByRole('row');
          strictEqual(rows.length, emptyTestData.length + 1);
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
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 0);
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
