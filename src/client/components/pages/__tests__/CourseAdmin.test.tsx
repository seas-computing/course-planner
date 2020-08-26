import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  ok,
  strictEqual,
} from 'assert';
import {
  render,
  waitForElement,
  wait,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
} from 'common/data';
import {
  MessageContext,
} from 'client/context';
import { MarkOneWrapper } from 'mark-one';
import { DispatchMessage } from '../../../context/MessageContext';
import CourseAdmin from '../CourseAdmin';

interface AppStubProps {
  /** A function that passes down the message, if any */
  dispatchMessage: DispatchMessage;
}

const AppStub: FunctionComponent<AppStubProps> = function (
  { dispatchMessage, children }
): ReactElement {
  return (
    <MemoryRouter>
      <MarkOneWrapper>
        <MessageContext.Provider value={dispatchMessage}>
          {children}
        </MessageContext.Provider>
      </MarkOneWrapper>
    </MemoryRouter>
  );
};

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
        <AppStub dispatchMessage={dispatchMessage}>
          <CourseAdmin />
        </AppStub>
      );
      return waitForElement(() => container.querySelector('.course-admin-table'));
    });
    context('when course data fetch succeeds', function () {
      it('displays the correct course information', async function () {
        const { getByText } = render(
          <AppStub dispatchMessage={dispatchMessage}>
            <CourseAdmin />
          </AppStub>
        );
        strictEqual(getStub.callCount, 1);
        const { title } = computerScienceCourseResponse;
        return waitForElement(() => getByText(title));
      });
      it('displays the correct number of rows in the table', async function () {
        const { getAllByRole } = render(
          <AppStub dispatchMessage={dispatchMessage}>
            <CourseAdmin />
          </AppStub>
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        strictEqual(rows.length, testData.length + 1);
      });
      it('displays the correct content in the table cells', async function () {
        const { getAllByRole } = render(
          <AppStub dispatchMessage={dispatchMessage}>
            <CourseAdmin />
          </AppStub>
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
      it('passes the backgroundColor prop only when area exists', async function () {
        const { getAllByRole, getByText } = render(
          <AppStub dispatchMessage={dispatchMessage}>
            <CourseAdmin />
          </AppStub>
        );
        await wait(() => getAllByRole('row').length > 1);
        const physicsCourseStyle = window.getComputedStyle(getByText('AP'));
        const newAreaCourseStyle = window.getComputedStyle(getByText('NA'));
        ok(physicsCourseStyle.backgroundColor);
        ok(!newAreaCourseStyle.backgroundColor);
      });
      context('when there are no course records', function () {
        const emptyTestData = [];
        beforeEach(function () {
          getStub.resolves(emptyTestData);
        });
        it('displays the correct number of rows in the table (only the header row)', async function () {
          const { getAllByRole } = render(
            <AppStub dispatchMessage={dispatchMessage}>
              <CourseAdmin />
            </AppStub>
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
          <AppStub dispatchMessage={dispatchMessage}>
            <CourseAdmin />
          </AppStub>
        );
        await wait(() => getAllByRole('row').length > 0);
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
