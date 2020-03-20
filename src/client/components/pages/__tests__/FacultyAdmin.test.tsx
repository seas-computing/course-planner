import React from 'react';
import {
  strictEqual,
  ok,
} from 'assert';
import {
  waitForElement,
  wait,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import request,
{ AxiosResponse } from 'axios';
import {
  physicsFacultyMemberResponse,
  bioengineeringFacultyMemberResponse,
  newAreaFacultyMemberResponse,
  error,
} from 'testData';
import { FacultyResponseDTO } from 'common/dto/faculty/facultyResponse.dto';
import { render } from 'test-utils';
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
    getStub = stub(request, 'get');
    dispatchMessage = stub();
    getStub.resolves({
      data: testData,
    } as AxiosResponse<FacultyResponseDTO[]>);
  });
  afterEach(function () {
    getStub.restore();
  });
  describe('rendering', function () {
    it('creates a table', async function () {
      const { container } = render(
        <FacultyAdmin />,
        dispatchMessage
      );
      return waitForElement(() => container.querySelector('.faculty-admin-table'));
    });
    context('when course data fetch succeeds', function () {
      it('displays the correct faculty information', async function () {
        const { getByText } = render(
          <FacultyAdmin />,
          dispatchMessage
        );
        strictEqual(getStub.callCount, 1);
        const { lastName } = bioengineeringFacultyMemberResponse;
        return waitForElement(() => getByText(lastName));
      });
      it('displays the correct number of rows in the table', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage
        );
        const rows = getAllByRole('row');
        await wait(() => rows.length > 1);
        strictEqual(rows.length, testData.length + 1);
      });
      it('displays the correct content in the table cells', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage
        );
        const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
        await wait(() => rows.length > 1);
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
      it('passes the backgroundColor prop only when area exists', async function () {
        const { getAllByRole, getByText } = render(
          <FacultyAdmin />,
          dispatchMessage
        );
        await wait(() => getAllByRole('row').length > 1);
        const physicsStyle = window.getComputedStyle(getByText('AP'));
        const newAreaStyle = window.getComputedStyle(getByText('NA'));
        ok(physicsStyle.backgroundColor);
        ok(!newAreaStyle.backgroundColor);
      });
    });
    context('when there are no faculty records', function () {
      const emptyTestData = [];
      beforeEach(function () {
        getStub.resolves({
          data: emptyTestData,
        } as AxiosResponse<FacultyResponseDTO[]>);
      });
      afterEach(function () {
        getStub.restore();
      });
      it('displays the correct number of rows in the table (only the header row', async function () {
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage
        );
        const rows = getAllByRole('row');
        await wait(() => rows.length > 0);
        strictEqual(rows.length, emptyTestData.length + 1);
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
        const { getAllByRole } = render(
          <FacultyAdmin />,
          dispatchMessage
        );
        await wait(() => getAllByRole('row').length > 0);
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
