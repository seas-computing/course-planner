import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  waitForElement,
  wait,
  within,
  fireEvent,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
  SinonSpy,
  spy,
} from 'sinon';
import { FacultyAPI } from 'client/api/faculty';
import {
  physicsFacultyMemberResponse,
  bioengineeringFacultyMemberResponse,
  newAreaFacultyMemberResponse,
  error,
  metadata,
} from 'testData';
import { render } from 'test-utils';
import FacultyAdmin from '../FacultyAdmin';
import * as filters from '../Filter';

describe('Faculty Admin', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  let filterSpy: SinonSpy;
  const testData = [
    physicsFacultyMemberResponse,
    bioengineeringFacultyMemberResponse,
    newAreaFacultyMemberResponse,
  ];
  beforeEach(function () {
    getStub = stub(FacultyAPI, 'getAllFacultyMembers');
    dispatchMessage = stub();
    getStub.resolves(testData);
    filterSpy = spy(filters, 'listFilter');
  });
  describe('rendering', function () {
    it('creates a table', async function () {
      const { container } = render(
        <FacultyAdmin />,
        dispatchMessage,
        metadata
      );
      return waitForElement(() => container.querySelector('.faculty-admin-table'));
    });
    it('displays the "create faculty" button', async function () {
      const { container } = render(
        <FacultyAdmin />,
        dispatchMessage,
        metadata
      );
      return waitForElement(() => container.querySelector('.create-faculty-button'));
    });
    context('when course data fetch succeeds', function () {
      it('displays the correct faculty information', async function () {
        const { getByText } = render(
          <FacultyAdmin />,
          dispatchMessage,
          metadata
        );
        strictEqual(getStub.callCount, 1);
        const { lastName } = bioengineeringFacultyMemberResponse;
        return waitForElement(() => getByText(lastName));
      });
      it('displays the filters in the second row', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        const utils = within(rows[1]);
        const facultyArea = utils.getAllByRole('option');
        const huid = utils.getAllByPlaceholderText('Filter by HUID');
        const lastName = utils.getAllByPlaceholderText('Filter by Last Name');
        const firstName = utils.getAllByPlaceholderText('Filter by First Name');
        strictEqual(facultyArea.length, metadata.areas.length + 1);
        strictEqual(huid.length, 1);
        strictEqual(lastName.length, 1);
        strictEqual(firstName.length, 1);
      });
      it('displays the correct number of rows in the table', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        // With the filter, there are two table header rows
        strictEqual(rows.length, testData.length + 2);
      });
      it('displays the correct content in the table cells', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
        const rowsContent = rows
          .map(
            (row) => (Array.from(row.cells).map((cell) => cell.textContent))
          );
        const physicsFacultyMemberArea = rowsContent[2][0];
        const physicsFacultyMemberHUID = rowsContent[2][1];
        const physicsFacultyMemberLastName = rowsContent[2][2];
        const bioengineeringFacultyMemberArea = rowsContent[3][0];
        const bioengineeringFacultyMemberHUID = rowsContent[3][1];
        const bioengineeringFacultyMemberLastName = rowsContent[3][2];
        strictEqual(
          physicsFacultyMemberArea,
          physicsFacultyMemberResponse.area.name
        );
        strictEqual(
          physicsFacultyMemberHUID,
          physicsFacultyMemberResponse.HUID
        );
        strictEqual(
          physicsFacultyMemberLastName,
          physicsFacultyMemberResponse.lastName
        );
        strictEqual(
          bioengineeringFacultyMemberArea,
          bioengineeringFacultyMemberResponse.area.name
        );
        strictEqual(
          bioengineeringFacultyMemberHUID,
          bioengineeringFacultyMemberResponse.HUID
        );
        strictEqual(
          bioengineeringFacultyMemberLastName,
          bioengineeringFacultyMemberResponse.lastName
        );
      });
      context('when the the dropdown and the text input filters are called', function () {
        it('calls the listFilter function once for each filter', async function () {
          const { getAllByRole } = render(
            <FacultyAdmin />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const facultyArea = utils.queryByLabelText(
            'The table will be filtered as selected in the faculty area dropdown filter'
          );
          filterSpy.resetHistory();
          fireEvent.change(facultyArea, { target: { value: 'AnyValue' } });
          // The Faculty Admin table contains 4 filters
          strictEqual(filterSpy.callCount, 4);
        });
        it('calls the listFilter once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <FacultyAdmin />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const facultyArea = utils.queryByLabelText(
            'The table will be filtered as selected in the faculty area dropdown filter'
          );
          filterSpy.resetHistory();
          fireEvent.change(facultyArea, { target: { value: 'All' } });
          strictEqual(filterSpy.callCount, 3);
        });
        it('calls the listFilter once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <FacultyAdmin />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const huid = utils.getAllByPlaceholderText('Filter by HUID');
          filterSpy.resetHistory();
          fireEvent.change(huid[0], { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 3);
        });
        it('calls the listFilter once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <FacultyAdmin />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const lastName = utils.getAllByPlaceholderText('Filter by Last Name');
          filterSpy.resetHistory();
          fireEvent.change(lastName[0], { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 3);
        });
        it('calls the listFilter once for each filter except the dropdown', async function () {
          const { getAllByRole } = render(
            <FacultyAdmin />,
            dispatchMessage,
            metadata
          );
          await wait(() => getAllByRole('row').length > 1);
          const rows = getAllByRole('row');
          const utils = within(rows[1]);
          const firstName = utils.getAllByPlaceholderText('Filter by First Name');
          filterSpy.resetHistory();
          fireEvent.change(firstName[0], { target: { value: 'AnyValue' } });
          strictEqual(filterSpy.callCount, 3);
        });
      });
    });
    context('when there are no faculty records', function () {
      const emptyTestData = [];
      beforeEach(function () {
        getStub.resolves(emptyTestData);
      });
      it('displays the correct number of rows in the table (only the header row', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
        const rows = getAllByRole('row');
        // With the filter, there are two table header rows
        strictEqual(rows.length, emptyTestData.length + 2);
      });
    });
    context('when course data fetch fails', function () {
      const emptyTestData = [];
      beforeEach(function () {
        getStub.rejects(error);
      });
      it('should throw an error', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length === emptyTestData.length + 1);
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
