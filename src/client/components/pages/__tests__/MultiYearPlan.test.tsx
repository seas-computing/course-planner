import React from 'react';
import { strictEqual } from 'assert';
import {
  BoundFunction,
  FindByText,
  fireEvent,
  QueryByText,
  wait,
  within,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
  spy,
  SinonSpy,
} from 'sinon';
import { render } from 'test-utils';
import { MultiYearPlanAPI } from 'client/api/multiYearPlan';
import { testFourYearPlan, error } from 'testData';
import MultiYearPlan from '../MultiYearPlan';
import * as filters from '../Filter';
import * as instructorFilters from '../utils/filterByInstructorValues';
import { WindowUtils } from '../utils/getHostname';

describe('MultiYearPlan', function () {
  let getStub: SinonStub;
  let windowStub: SinonStub;
  let dispatchMessage: SinonStub;
  let listFilterSpy: SinonSpy;
  let facultyFilterSpy: SinonSpy;
  const testData = testFourYearPlan;
  const instructionalText = 'How to use this site:';
  context('when visiting planning.seas', function () {
    let queryByText: BoundFunction<QueryByText>;
    beforeEach(function () {
      getStub = stub(MultiYearPlanAPI, 'getMultiYearPlan');
      windowStub = stub(WindowUtils, 'getHostname');
      dispatchMessage = stub();
      getStub.resolves(testData);
      windowStub.returns(new URL(process.env.CLIENT_URL).hostname);
      listFilterSpy = spy(filters, 'listFilter');
      facultyFilterSpy = spy(instructorFilters, 'filterPlansByInstructors');
    });
    describe('rendering', function () {
      it('creates a table', async function () {
        const { findByRole } = render(
          <MultiYearPlan />
        );
        return findByRole('table');
      });
      it('does not display instructional text', function () {
        ({ queryByText } = render(
          <MultiYearPlan />
        ));
        strictEqual(queryByText(instructionalText), null);
      });
    });
    describe('data fetching', function () {
      context('when the request succeeds', function () {
        context('with records', function () {
          it('displays the MYP information', async function () {
            const { findByText } = render(
              <MultiYearPlan />
            );
            strictEqual(getStub.callCount, 1);
            const { title } = testData[0];
            return findByText(title);
          });
          it('displays the correct number of rows in the table', async function () {
            const { getAllByRole } = render(
              <MultiYearPlan />
            );
            await wait(() => getAllByRole('row').length > 1);
            const rows = getAllByRole('row');
            strictEqual(rows.length, testData.length + 2);
          });
          it('displays the correct content in the table cells', async function () {
            const { getAllByRole } = render(
              <MultiYearPlan />
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
              <MultiYearPlan />
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
            { dispatchMessage }
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
              <MultiYearPlan />
            );
            await wait(() => getAllByRole('row').length > 1);
            const rows = getAllByRole('row');
            const utils = within(rows[1]);
            const catalogPrefixInput = utils.queryByLabelText('The table will be filtered as selected in the catalog prefix dropdown filter');
            listFilterSpy.resetHistory();
            fireEvent.change(catalogPrefixInput, { target: { value: 'All' } });
            strictEqual(listFilterSpy.callCount, 2);
          });
        });
        context('when any other value is selected', function () {
          it('calls the listFilter function once for each filter', async function () {
            const { getAllByRole } = render(
              <MultiYearPlan />
            );
            await wait(() => getAllByRole('row').length > 1);
            const rows = getAllByRole('row');
            const utils = within(rows[1]);
            const catalogPrefixInput = utils.queryByLabelText('The table will be filtered as selected in the catalog prefix dropdown filter');
            listFilterSpy.resetHistory();
            fireEvent.change(catalogPrefixInput, { target: { value: 'AnyValue' } });
            strictEqual(listFilterSpy.callCount, 3);
          });
        });
      });
      describe('Catalog Number', function () {
        context('when a value is entered', function () {
          it('calls the listFilter function once for each filter except the dropdown', async function () {
            const { getAllByRole } = render(
              <MultiYearPlan />
            );
            await wait(() => getAllByRole('row').length > 1);
            const rows = getAllByRole('row');
            const utils = within(rows[1]);
            const catalogNumber = utils.queryByLabelText('The table will be filtered as characters are typed in this catalog number filter field');
            listFilterSpy.resetHistory();
            fireEvent.change(catalogNumber, { target: { value: 'AnyValue' } });
            strictEqual(listFilterSpy.callCount, 2);
          });
        });
        context('when no value is entered', function () {
          it('does not call the listFilter function', async function () {
            const { getAllByRole } = render(
              <MultiYearPlan />
            );
            await wait(() => getAllByRole('row').length > 1);
            listFilterSpy.resetHistory();
            strictEqual(listFilterSpy.callCount, 0);
          });
        });
      });
      describe('Course Title', function () {
        context('when a value is entered', function () {
          it('calls the listFilter function once for each filter except the dropdown', async function () {
            const { getAllByRole } = render(
              <MultiYearPlan />
            );
            await wait(() => getAllByRole('row').length > 1);
            const rows = getAllByRole('row');
            const utils = within(rows[1]);
            const courseTitle = utils.queryByLabelText('The table will be filtered as characters are typed in this course title filter field');
            listFilterSpy.resetHistory();
            fireEvent.change(courseTitle, { target: { value: 'AnyValue' } });
            strictEqual(listFilterSpy.callCount, 2);
          });
        });
        context('when no value is entered', function () {
          it('does not call the listFilter function', async function () {
            const { getAllByRole } = render(
              <MultiYearPlan />
            );
            await wait(() => getAllByRole('row').length > 1);
            listFilterSpy.resetHistory();
            strictEqual(listFilterSpy.callCount, 0);
          });
        });
      });
      describe('Instructors', function () {
        context('when a value is entered', function () {
          context('for all instructor fields', function () {
            it('calls the filterPlansByInstructors once per field', async function () {
              const { getAllByRole } = render(
                <MultiYearPlan />
              );
              await wait(() => getAllByRole('row').length > 1);
              const rows = getAllByRole('row');
              const utils = within(rows[1]);
              const instructorFields = utils.queryAllByLabelText('The table will be filtered as characters are typed in this instructors filter field');
              facultyFilterSpy.resetHistory();
              instructorFields.forEach((instructorField) => {
                fireEvent.change(instructorField, { target: { value: 'AnyValue' } });
              });
              strictEqual(facultyFilterSpy.callCount, instructorFields.length);
            });
          });
          context('for one instructor field', function () {
            it('calls the filterPlansByInstructors once', async function () {
              const { getAllByRole } = render(
                <MultiYearPlan />
              );
              await wait(() => getAllByRole('row').length > 1);
              const rows = getAllByRole('row');
              const utils = within(rows[1]);
              const instructorFields = utils.queryAllByLabelText('The table will be filtered as characters are typed in this instructors filter field');
              facultyFilterSpy.resetHistory();
              fireEvent.change(instructorFields[0], { target: { value: 'AnyValue' } });
              strictEqual(facultyFilterSpy.callCount, 1);
            });
          });
        });
        context('when no value is entered', function () {
          it('does not call the filterPlansByInstructors function', async function () {
            const { getAllByRole } = render(
              <MultiYearPlan />
            );
            await wait(() => getAllByRole('row').length > 1);
            facultyFilterSpy.resetHistory();
            strictEqual(facultyFilterSpy.callCount, 0);
          });
        });
      });
    });
  });
  context('when visiting info.seas', function () {
    let findByText: BoundFunction<FindByText>;
    beforeEach(function () {
      getStub = stub(MultiYearPlanAPI, 'getMultiYearPlan');
      windowStub = stub(WindowUtils, 'getHostname');
      dispatchMessage = stub();
      getStub.resolves(testData);
      windowStub.returns(new URL(process.env.PUBLIC_CLIENT_URL).hostname);
      listFilterSpy = spy(filters, 'listFilter');
      facultyFilterSpy = spy(instructorFilters, 'filterPlansByInstructors');
    });
    describe('rendering', function () {
      it('displays instructional text', async function () {
        ({ findByText } = render(
          <MultiYearPlan />
        ));
        await findByText(instructionalText, { exact: false });
      });
    });
  });
});
