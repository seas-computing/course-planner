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
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  stub,
  SinonStub,
} from 'sinon';
import request,
{ AxiosResponse } from 'axios';
import * as dummy from 'testData';
import * as api from 'client/api';
import {
  MessageContext,
  messageReducer,
} from 'client/context';
import { ThemeProvider } from 'styled-components';
import { MarkOneTheme } from 'mark-one';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import CourseAdmin from '../pages/CourseAdmin';

describe('Course Admin', function () {
  let getStub: SinonStub;
  beforeEach(function () {
    getStub = stub(request, 'get');
    getStub.resolves({
      data: [
        dummy.manageCourseResponseExample,
        dummy.anotherManageCourseResponseExample,
      ],
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
    context('when course data fetch succeeds', function () {
      it('displays the correct course information', async function () {
        const { getByText } = render(
          <AppStub>
            <CourseAdmin />
          </AppStub>
        );
        strictEqual(getStub.callCount, 1);
        const { title } = dummy.manageCourseResponseExample;
        return waitForElement(() => getByText(title));
      });
      it('displays the correct number of rows in the table', function () {
        const { getAllByRole } = render(
          <AppStub>
            <CourseAdmin />
          </AppStub>
        );
        const rows = getAllByRole('row', { exact: false });
        strictEqual(rows.length, 3);
      });
      context('when there are no course records', function () {
        beforeEach(function () {
          getStub.resolves({
            data: [],
          } as AxiosResponse<ManageCourseResponseDTO[]>);
        });
        afterEach(function () {
          getStub.restore();
        });
        it('displays the correct number of rows in the table (only the header row)', function () {
          const { getAllByRole } = render(
            <AppStub>
              <CourseAdmin />
            </AppStub>
          );
          const rows = getAllByRole('row');
          strictEqual(rows.length, 1);
        });
      });
    });
    context('when course data fetch fails', function () {
      beforeEach(function () {
        getStub.rejects(dummy.error);
      });
      afterEach(function () {
        getStub.restore();
      });
      it('should throw an error', async function () {
        try {
          await api.getAllCourses();
          fail('Did not throw an error');
        } catch (err) {
          deepStrictEqual(err, dummy.error);
        }
      });
    });
  });
});
