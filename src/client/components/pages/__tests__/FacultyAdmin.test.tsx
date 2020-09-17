import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  waitForElement,
  wait,
  fireEvent,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import { FacultyAPI } from 'client/api/faculty';
import {
  physicsFacultyMemberResponse,
  bioengineeringFacultyMemberResponse,
  newAreaFacultyMemberResponse,
  error,
} from 'common/data';
import { render } from 'test-utils';
import { metadata } from 'common/data/metadata';
import FacultyAdmin from '../FacultyAdmin';

describe('Faculty Admin', function () {
  let getStub: SinonStub;
  let dispatchMessage: SinonStub;
  const testData = [
    physicsFacultyMemberResponse,
    bioengineeringFacultyMemberResponse,
    newAreaFacultyMemberResponse,
  ];
  beforeEach(function () {
    getStub = stub(FacultyAPI, 'getAllFacultyMembers');
    dispatchMessage = stub();
    getStub.resolves(testData);
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
      it('displays the correct number of rows in the table', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        strictEqual(rows.length, testData.length + 1);
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
        const physicsFacultyMemberArea = rowsContent[1][0];
        const physicsFacultyMemberHUID = rowsContent[1][1];
        const physicsFacultyMemberLastName = rowsContent[1][2];
        const bioengineeringFacultyMemberArea = rowsContent[2][0];
        const bioengineeringFacultyMemberHUID = rowsContent[2][1];
        const bioengineeringFacultyMemberLastName = rowsContent[2][2];
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
      it('does not pass the backgroundColor prop when area does not exist', async function () {
        const { getAllByRole, getByText } = render(
          <FacultyAdmin />,
          dispatchMessage,
          metadata
        );
        await wait(() => getAllByRole('row').length > 1);
        const newAreaStyle = window.getComputedStyle(getByText('NA'));
        strictEqual(newAreaStyle.backgroundColor, '');
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
        strictEqual(rows.length, emptyTestData.length + 1);
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
