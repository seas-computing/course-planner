import { strictEqual } from 'assert';
import {
  render,
  waitForElement,
} from '@testing-library/react';
import * as dummy from 'testData';
import {
  stub,
  SinonStub,
} from 'sinon';
import { ForbiddenException } from '@nestjs/common';
import request,
{ AxiosResponse } from 'axios';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import React from 'react';
import { App } from 'client/components/App';
import { Simulate } from 'react-dom/test-utils';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

describe('Course Admin', function () {
  context('when data is successfully retrieved', function () {
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
    it('displays the Course Admin table', async function () {
      const history = createMemoryHistory();
      const { getByText } = render(
        <Router history={history}>
          <App />
        </Router>
      );
      Simulate.click(getByText('Course Admin'), { button: 0 });
      await waitForElement(() => getByText('Course Prefix'));
      const table = document.getElementsByClassName('course-admin-table')[0] as HTMLTableElement;
      const rows = table.getElementsByTagName('tr');
      strictEqual(rows.length, 3);
    });
  });
  context('when a 403 Forbidden error is thrown', function () {
    let getStub: SinonStub;
    beforeEach(function () {
      getStub = stub(request, 'get');
      getStub.rejects(new ForbiddenException());
    });
    afterEach(function () {
      getStub.restore();
    });
    it('displays the appropriate error message', async function () {
      const history = createMemoryHistory();
      const { getByText } = render(
        <Router history={history}>
          <App />
        </Router>
      );
      Simulate.click(getByText('Course Admin'), { button: 0 });
      await waitForElement(() => getByText('Course Prefix'));
      getByText('Unable to get user data from server.', { exact: false });
    });
  });
});
