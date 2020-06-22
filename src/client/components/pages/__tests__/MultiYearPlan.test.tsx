import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  wait,
  findByRole,
  findByText,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import request, { AxiosResponse } from 'axios';
import {
  testFourYearPlan,
  error,
} from 'testData';
import {
  MultiYearPlanResponseDTO,
} from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';
import { render } from 'test-utils';
import MultiYearPlan from '../MultiYearPlan';

describe('MultYearPlan', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;

  const testData = testFourYearPlan;

  beforeEach(function () {
    getStub = stub(request, 'get');
    dispatchMessage = stub();
    getStub.resolves({
      data: testData,
    } as AxiosResponse<MultiYearPlanResponseDTO[]>);
  });
  afterEach(function () {
    getStub.restore();
  });
  describe('rendering', function () {
    it('create table', async function () {
      const { container } = render(
        <MultiYearPlan />,
        dispatchMessage
      );
      return findByRole(container, 'table');
    });
  });

  context('when multi year plan data fetch succeeds', function () {
    it('displays the MYP area information', async function () {
      const { container } = render(
        <MultiYearPlan />,
        dispatchMessage
      );
      strictEqual(getStub.callCount, 1);
      const { area } = testFourYearPlan[0];
      return findByText(container, area);
    });
    it('displays the correct number of rows in the table', async function () {
      const { getAllByRole } = render(
        <MultiYearPlan />,
        dispatchMessage
      );
      await wait(() => getAllByRole('row').length > 1);
      const rows = getAllByRole('row');
      strictEqual(rows.length, testData.length + 1);
    });
    it('displays the correct content in the table cells', async function () {
      const { getAllByRole } = render(
        <MultiYearPlan />,
        dispatchMessage
      );
      await wait(() => getAllByRole('row').length > 1);
      const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
      const rowsContent = rows
        .map(
          (row) => (Array.from(row.cells).map((cell) => cell.textContent))
        );
      strictEqual(rowsContent[1][0], testFourYearPlan[0].area);
      strictEqual(rowsContent[1][1], testFourYearPlan[0].catalogNumber);
      strictEqual(rowsContent[1][2], testFourYearPlan[0].title);
      const facultyNames1 = testFourYearPlan[0].semesters
        .map((semester) => semester.instance.faculty.map((f) => f.displayName).join(''))
        .join();
      const facultyNames2 = rowsContent[1].slice(3).join();
      strictEqual(facultyNames1, facultyNames2);
    });
  });

  context('when there are empty records of multi year plan ', function () {
    let emptyTestData;
    beforeEach(function () {
      emptyTestData = [];
      getStub.resolves({
        data: emptyTestData,
      } as AxiosResponse<MultiYearPlanResponseDTO[]>);
    });
    afterEach(function () {
      getStub.restore();
    });
    it('only displays the header row', async function () {
      const { getAllByRole } = render(
        <MultiYearPlan />,
        dispatchMessage
      );
      await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
      const rows = getAllByRole('row');
      strictEqual(rows.length, 1);
    });
  });

  context('when multi year plan data fetch fails', function () {
    const emptyTestData = [];
    beforeEach(function () {
      getStub.rejects(error);
    });
    afterEach(function () {
      getStub.restore();
    });
    it('should throw an error', async function () {
      const { getAllByRole } = render(
        <MultiYearPlan />,
        dispatchMessage
      );
      await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
      strictEqual(dispatchMessage.callCount, 1);
    });
  });
});
