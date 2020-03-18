import React, {
  FunctionComponent,
  ReactElement,
} from 'react';
import {
  ok,
  strictEqual,
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
  });
});
