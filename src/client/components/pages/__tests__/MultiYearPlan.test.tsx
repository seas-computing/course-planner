import React from 'react';
import { strictEqual } from 'assert';
import { fireEvent, wait, within } from '@testing-library/react';
import {
  stub,
  SinonStub,
  spy,
  SinonSpy,
} from 'sinon';
import { render } from 'test-utils';
import { MultiYearPlanAPI } from 'client/api/multiYearPlan';
import { testFourYearPlan, error, metadata } from 'testData';
import MultiYearPlan from '../MultiYearPlan';
import * as filters from '../Filter';

describe('MultiYearPlan', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  let filterSpy: SinonSpy;
  const testData = testFourYearPlan;

  beforeEach(function () {
    getStub = stub(MultiYearPlanAPI, 'getMultiYearPlan');
    dispatchMessage = stub();
    getStub.resolves(testData);
    filterSpy = spy(filters, 'listFilter');
  });
  describe('rendering', function () {
    it('creates a table', async function () {
      const { findByRole } = render(
        <MultiYearPlan />,
        dispatchMessage,
        metadata
      );
      return findByRole('table');
    });
  });
  describe('data fetching', function () {
    context('when the request succeeds', function () {
      context('with records', function () {
        it('displays the MYP information', async function () {
          const { findByText } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          strictEqual(getStub.callCount, 1);
          const { title } = testData[0];
          return findByText(title);
        });
        it('displays the correct number of rows in the table', async function () {
          const { getAllByRole } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          strictEqual(rows.length, testData.length + 2);
        });
        it('displays the correct content in the table cells', async function () {
          const { getAllByRole } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
          const rowsContent = rows
            .map(
              (row) => (Array.from(row.cells).map((cell) => cell.textContent))
            );
          strictEqual(rowsContent[2][0], testData[0].catalogPrefix);
          strictEqual(rowsContent[2][1], testData[0].catalogNumber);
          strictEqual(rowsContent[2][2], testData[0].title);
          const facultyNames1 = testData[0].semesters
            .map((semester) => semester.instance.faculty.map((f) => f.displayName).join(''))
            .join();
          const facultyNames2 = rowsContent[2].slice(3).join();
          strictEqual(facultyNames1, facultyNames2);
        });
      });
      context('with no records', function () {
        let emptyTestData: unknown[];
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
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
          const rows = getAllByRole('row');
          strictEqual(rows.length, 2);
        });
      });
    });
    context('when the request fails', function () {
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
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
  describe('data filtering', function () {
    describe('Catalog Prefix', function () {
      context('when "All" is selected', function () {
        it('calls the listFilter once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const catalogPrefixInput = utils.queryByLabelText('The table will be filtered as selected in the catalog prefix dropdown filter');
          filterSpy.resetHistory();
          fireEvent.change(catalogPrefixInput, { target: { value: 'All' } });
          strictEqual(filterSpy.callCount, 2);
        });
      });
      context('when any other value is selected', function () {
        it('calls the listFilter function once for each filter', async function () {
          const { getAllByRole } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const catalogPrefixInput = utils.queryByLabelText('The table will be filtered as selected in the catalog prefix dropdown filter');
          filterSpy.resetHistory();
          fireEvent.change(catalogPrefixInput, { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 3);
        });
      });
    });
    describe('Catalog Number', function () {
      context('when a value is entered', function () {
        it('calls the listFilter function once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const catalogNumber = utils.queryByLabelText('The table will be filtered as characters are typed in this catalog number filter field');
          filterSpy.resetHistory();
          fireEvent.change(catalogNumber, { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 2);
        });
      });
      context('when no value is entered', function () {
        it('does not call the listFilter function', async function () {
          const { getAllByRole } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          filterSpy.resetHistory();
          strictEqual(filterSpy.callCount, 0);
        });
      });
    });
    describe('Course Title', function () {
      context('when a value is entered', function () {
        it('calls the listFilter function once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const courseTitle = utils.queryByLabelText('The table will be filtered as characters are typed in this course title filter field');
          filterSpy.resetHistory();
          fireEvent.change(courseTitle, { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 2);
        });
      });
      context('when no value is entered', function () {
        it('does not call the listFilter function', async function () {
          const { getAllByRole } = render(
            <MultiYearPlan />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          filterSpy.resetHistory();
          strictEqual(filterSpy.callCount, 0);
        });
      });
    });
  });
});
