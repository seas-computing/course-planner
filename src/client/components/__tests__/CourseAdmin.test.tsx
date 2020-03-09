import React from 'react';
// import { strictEqual } from 'assert';
import { render, waitForElement } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { stub, SinonStub } from 'sinon';
import { AxiosResponse } from 'axios';
import {
  manageCourseResponseExample,
  anotherManageCourseResponseExample,
} from 'testData';
import * as api from 'client/api';
import { ThemeProvider } from 'styled-components';
import { MarkOneTheme } from 'mark-one';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import CourseAdmin from '../pages/CourseAdmin';

describe('Course Admin', function () {
  let apiStub: SinonStub;
  beforeEach(function () {
    apiStub = stub(api, 'getAllCourses');
    apiStub.resolves({
      data: [
        manageCourseResponseExample,
        anotherManageCourseResponseExample,
      ],
    } as AxiosResponse<ManageCourseResponseDTO[]>);
  });
  afterEach(function () {
    apiStub.restore();
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
  });
});
