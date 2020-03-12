import React, {
  useReducer,
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  strictEqual,
  deepStrictEqual,
  fail,
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
import request,
{ AxiosResponse } from 'axios';
import {
  computerScienceCourseResponse,
  physicsCourseResponse,
  error,
} from 'testData';
import * as api from 'client/api';
import {
  MessageContext,
  messageReducer,
} from 'client/context';
import { ThemeProvider } from 'styled-components';
import { MarkOneTheme } from 'mark-one';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import CourseAdmin from '../pages/CourseAdmin';

const AppStub: FunctionComponent = function ({ children }): ReactElement {
  const [, dispatchMessage] = useReducer(
    messageReducer,
    {
      queue: [],
      currentMessage: undefined,
    }
  );
  return (
    <MemoryRouter>
      <ThemeProvider theme={MarkOneTheme}>
        <MessageContext.Provider value={dispatchMessage}>
          {children}
        </MessageContext.Provider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Course Admin', function () {
  let getStub: SinonStub;
  const testData = [
    computerScienceCourseResponse,
    physicsCourseResponse,
  ];
  beforeEach(function () {
    getStub = stub(request, 'get');
    getStub.resolves({
      data: testData,
    } as AxiosResponse<ManageCourseResponseDTO[]>);
  });
  afterEach(function () {
    getStub.restore();
  });
  describe('rendering', function () {
    it('creates a table', async function () {
      const { container } = render(
        <MemoryRouter>
          <ThemeProvider theme={MarkOneTheme}>
            <CourseAdmin />
          </ThemeProvider>
        </MemoryRouter>
      );
      return waitForElement(() => container.querySelector('.course-admin-table'));
    });
    context('when course data fetch succeeds', function () {
      it('displays the correct course information', async function () {
        const { getByText } = render(
          <AppStub>
            <CourseAdmin />
          </AppStub>
        );
        strictEqual(getStub.callCount, 1);
        const { title } = computerScienceCourseResponse;
        return waitForElement(() => getByText(title));
      });
      it('displays the correct number of rows in the table', async function () {
        const { getAllByRole } = render(
          <AppStub>
            <CourseAdmin />
          </AppStub>
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        strictEqual(rows.length, testData.length + 1);
      });
      it('displays the correct content in the table cells', async function () {
        const { getAllByRole } = render(
          <AppStub>
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
        strictEqual(computerScienceCourseCatalogNumber,
          computerScienceCourseResponse.catalogNumber);
        strictEqual(computerScienceCourseTitle,
          computerScienceCourseResponse.title);
        strictEqual(physicsCourseCatalogNumber,
          physicsCourseResponse.catalogNumber);
        strictEqual(physicsCourseTitle, physicsCourseResponse.title);
      });
      context('when there are no course records', function () {
        const emptyTestData = [];
        beforeEach(function () {
          getStub.resolves({
            data: emptyTestData,
          } as AxiosResponse<ManageCourseResponseDTO[]>);
        });
        afterEach(function () {
          getStub.restore();
        });
        it('displays the correct number of rows in the table (only the header row)',
          async function () {
            const { getAllByRole } = render(
              <AppStub>
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
      afterEach(function () {
        getStub.restore();
      });
      it('should throw an error', async function () {
        try {
          await api.getAllCourses();
          fail('Did not throw an error');
        } catch (err) {
          deepStrictEqual(err, error);
        }
      });
    });
  });
});
