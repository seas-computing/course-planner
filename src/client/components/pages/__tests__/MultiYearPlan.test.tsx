import React from 'react';
import { strictEqual } from 'assert';
import { wait } from '@testing-library/react';
import { stub, SinonStub } from 'sinon';
import { testFourYearPlan, error } from 'testData';
import { render } from 'test-utils';
import * as mypAPI from 'client/api/multiYearPlan';
import MultiYearPlan from '../MultiYearPlan';

describe('MultYearPlan', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;

  const testData = testFourYearPlan;

  beforeEach(function () {
    getStub = stub(mypAPI, 'getMultiYearPlan');
    dispatchMessage = stub();
    getStub.resolves(testData);
  });
  afterEach(function () {
    getStub.restore();
  });
  describe('rendering', function () {
    it('create table', async function () {
      const { findByRole } = render(
        <MultiYearPlan />,
        dispatchMessage
      );
      return findByRole('table');
    });
  });

  context('when multi year plan data fetch succeeds', function () {
    it('displays the MYP area information', async function () {
      const { findByText } = render(
        <MultiYearPlan />,
        dispatchMessage
      );
      strictEqual(getStub.callCount, 1);
      const { area } = testData[0];
      return findByText(area);
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
      strictEqual(rowsContent[1][0], testData[0].area);
      strictEqual(rowsContent[1][1], testData[0].catalogNumber);
      strictEqual(rowsContent[1][2], testData[0].title);
      const facultyNames1 = testData[0].semesters
        .map((semester) => semester.instance.faculty.map((f) => f.displayName).join(''))
        .join();
      const facultyNames2 = rowsContent[1].slice(3).join();
      strictEqual(facultyNames1, facultyNames2);
    });
  });

  context('when there are empty records of multi year plan ', function () {
    let emptyTestData: Array<unknown>;
    beforeEach(function () {
      emptyTestData = [];
      getStub.resolves(emptyTestData);
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
