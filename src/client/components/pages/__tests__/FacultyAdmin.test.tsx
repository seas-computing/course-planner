import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  strictEqual,
  ok,
} from 'assert';
import {
  render,
  waitForElement,
  wait,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
import {
  MessageContext,
} from 'client/context';
import { ThemeProvider } from 'styled-components';
import { MarkOneTheme } from 'mark-one';
import { FacultyResponseDTO } from 'common/dto/faculty/facultyResponse.dto';
import { DispatchMessage } from '../../../context/MessageContext';
import FacultyAdmin from '../FacultyAdmin';

interface AppStubProps {
  /** A function that passes down the message, if any */
  dispatchMessage: DispatchMessage;
}

const AppStub: FunctionComponent<AppStubProps> = function (
  { dispatchMessage, children }
): ReactElement {
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
        <AppStub dispatchMessage={dispatchMessage}>
          <FacultyAdmin />
        </AppStub>
      );
      return waitForElement(() => container.querySelector('.faculty-admin-table'));
    });
    context('when course data fetch succeeds', function () {
      it('displays the correct faculty information', async function () {
        const { getByText } = render(
          <AppStub dispatchMessage={dispatchMessage}>
            <FacultyAdmin />
          </AppStub>
        );
        strictEqual(getStub.callCount, 1);
        const { lastName } = bioengineeringFacultyMemberResponse;
        return waitForElement(() => getByText(lastName));
      });
      it('displays the correct number of rows in the table', async function () {
        const { getAllByRole } = render(
          <AppStub dispatchMessage={dispatchMessage}>
            <FacultyAdmin />
          </AppStub>
        );
        await wait(() => getAllByRole('row').length > 1);
        const rows = getAllByRole('row');
        strictEqual(rows.length, testData.length + 1);
      });
      it('displays the correct content in the table cells', async function () {
        const { getAllByRole } = render(
          <AppStub dispatchMessage={dispatchMessage}>
            <FacultyAdmin />
          </AppStub>
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
      it('passes the backgroundColor prop only when area exists', async function () {
        const { getAllByRole, getByText } = render(
          <AppStub dispatchMessage={dispatchMessage}>
            <FacultyAdmin />
          </AppStub>
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
          <AppStub dispatchMessage={dispatchMessage}>
            <FacultyAdmin />
          </AppStub>
        );
        await wait(() => getAllByRole('row').length > 0);
        const rows = getAllByRole('row');
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
          <AppStub dispatchMessage={dispatchMessage}>
            <FacultyAdmin />
          </AppStub>
        );
        await wait(() => getAllByRole('row').length > 0);
        strictEqual(dispatchMessage.callCount, 1);
      });
    });
  });
});
