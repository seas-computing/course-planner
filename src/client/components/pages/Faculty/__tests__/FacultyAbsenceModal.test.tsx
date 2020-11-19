import assert, {
  strictEqual,
} from 'assert';
import React from 'react';
import {
  SinonStub,
  stub,
} from 'sinon';
import {
  AllByRole,
  BoundFunction,
  fireEvent,
  GetByText,
  QueryByText,
  render,
  wait,
  waitForElement,
} from 'test-utils';
import {
  appliedMathFacultyScheduleResponse,
  facultyAbsenceRequest,
  facultyAbsenceResponse,
  metadata,
} from 'testData';
import { FacultyAPI } from 'client/api';
import FacultyAbsenceModal from '../FacultyAbsenceModal';

describe('Faculty Absence Modal', function () {
  let queryAllByRole: BoundFunction<AllByRole>;
  let getByLabelText: BoundFunction<GetByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByText: BoundFunction<QueryByText>;
  const dispatchMessage: SinonStub = stub();
  let onSuccessStub: SinonStub;
  let onCloseStub: SinonStub;
  let putStub: SinonStub;
  describe('On Open Behavior', function () {
    beforeEach(function () {
      ({ getByLabelText, queryAllByRole, queryByText } = render(
        <FacultyAbsenceModal
          isVisible
          currentFaculty={appliedMathFacultyScheduleResponse}
          currentAbsence={facultyAbsenceRequest}
        />,
        dispatchMessage,
        metadata
      ));
    });
    it('populates the absence field according to the current absence selected', function () {
      const absenceSelect = getByLabelText('Sabbatical/Leave', { exact: false }) as HTMLSelectElement;
      strictEqual(
        absenceSelect.value,
        facultyAbsenceRequest.type
      );
    });
    it('renders no error messages prior to initial form submission', function () {
      strictEqual(queryAllByRole('alert').length, 0);
    });
    it('does not render "Present" as an option in the absence dropdown', function () {
      strictEqual(queryByText('Present'), null);
    });
    it('renders "None" as an option in the absence dropdown', function () {
      const noneOption = queryByText('None');
      assert(noneOption);
    });
  });
  describe('Submit Behavior', function () {
    context('when there are no errors', function () {
      beforeEach(function () {
        putStub = stub(FacultyAPI, 'updateFacultyAbsence');
        putStub.resolves({ data: facultyAbsenceResponse });
        onSuccessStub = stub();
        onCloseStub = stub();
        ({ getByLabelText, getByText } = render(
          <FacultyAbsenceModal
            isVisible
            currentFaculty={appliedMathFacultyScheduleResponse}
            currentAbsence={facultyAbsenceRequest}
            onSuccess={onSuccessStub}
            onClose={onCloseStub}
          />,
          dispatchMessage,
          metadata
        ));
        const absenceSelect = getByLabelText('Sabbatical/Leave', { exact: false }) as HTMLSelectElement;
        fireEvent.change(
          absenceSelect,
          { target: { value: facultyAbsenceResponse.type } }
        );
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
      });
      it('calls the onSuccess handler once on submit', async function () {
        await wait(() => strictEqual(onSuccessStub.callCount, 1));
      });
      it('calls the onSuccess handler with the provided arguments', async function () {
        await wait(() => strictEqual(
          onSuccessStub.args[0][0].data,
          facultyAbsenceResponse
        ));
      });
      it('calls the onClose handler once', async function () {
        await wait(() => strictEqual(onCloseStub.callCount, 1));
      });
    });
    context('when there is an error', function () {
      const errorMessage = 'There was a problem with editing an absence entry.';
      beforeEach(function () {
        putStub = stub(FacultyAPI, 'updateFacultyAbsence');
        putStub.rejects(new Error(errorMessage));
        onSuccessStub = stub();
        onCloseStub = stub();
        ({ getByText } = render(
          <FacultyAbsenceModal
            isVisible
            currentFaculty={appliedMathFacultyScheduleResponse}
            currentAbsence={facultyAbsenceRequest}
            onSuccess={onSuccessStub}
            onClose={onCloseStub}
          />,
          dispatchMessage,
          metadata
        ));
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
      });
      it('does not call the onSuccess handler on submit', async function () {
        await wait(() => strictEqual(onSuccessStub.callCount, 0));
      });
      it('does not call the onClose handler', async function () {
        await wait(() => strictEqual(onCloseStub.callCount, 0));
      });
      it('renders the error message', async function () {
        return waitForElement(
          () => getByText(errorMessage, { exact: false })
        );
      });
    });
  });
});