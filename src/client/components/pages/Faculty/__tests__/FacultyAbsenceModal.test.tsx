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
  RenderResult,
  wait,
  waitForElement,
} from 'test-utils';
import {
  appliedMathFacultyScheduleResponse,
  facultyAbsenceRequest,
  facultyAbsenceResponse,
} from 'testData';
import { FacultyAPI } from 'client/api';
import FacultyAbsenceModal from '../FacultyAbsenceModal';

describe('Faculty Absence Modal', function () {
  let queryAllByRole: BoundFunction<AllByRole>;
  let getByLabelText: BoundFunction<GetByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByText: BoundFunction<QueryByText>;
  let onSuccessStub: SinonStub;
  let onCancelStub: SinonStub;
  let putStub: SinonStub;
  describe('On Open Behavior', function () {
    beforeEach(function () {
      onSuccessStub = stub();
      onCancelStub = stub();
      ({ getByLabelText, queryAllByRole, queryByText } = render(
        <FacultyAbsenceModal
          isVisible
          currentFaculty={appliedMathFacultyScheduleResponse}
          currentAbsence={facultyAbsenceRequest}
          onSuccess={onSuccessStub}
          onCancel={onCancelStub}
        />
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
      beforeEach(async function () {
        putStub = stub(FacultyAPI, 'updateFacultyAbsence');
        putStub.resolves({ data: facultyAbsenceResponse });
        onSuccessStub = stub();
        onCancelStub = stub();
        ({ getByLabelText, getByText, queryByText } = render(
          <FacultyAbsenceModal
            isVisible
            currentFaculty={appliedMathFacultyScheduleResponse}
            currentAbsence={facultyAbsenceRequest}
            onSuccess={onSuccessStub}
            onCancel={onCancelStub}
          />
        ));
        const absenceSelect = getByLabelText('Sabbatical/Leave', { exact: false }) as HTMLSelectElement;
        fireEvent.change(
          absenceSelect,
          { target: { value: facultyAbsenceResponse.type } }
        );
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
        await wait(
          () => !queryByText(
            `Sabbatical/Leave for ${appliedMathFacultyScheduleResponse.firstName}`, { exact: false }
          )
        );
      });
      it('calls the onSuccess handler once on submit', function () {
        strictEqual(onSuccessStub.callCount, 1);
      });
    });
    context('when there is an error', function () {
      const errorMessage = 'There was a problem with editing an absence entry.';
      let result: RenderResult;
      beforeEach(function () {
        putStub = stub(FacultyAPI, 'updateFacultyAbsence');
        putStub.rejects(new Error(errorMessage));
        onSuccessStub = stub();
        onCancelStub = stub();
        result = render(
          <FacultyAbsenceModal
            isVisible
            currentFaculty={appliedMathFacultyScheduleResponse}
            currentAbsence={facultyAbsenceRequest}
            onSuccess={onSuccessStub}
            onCancel={onCancelStub}
          />
        );
        ({ getByText } = result);
        const submitButton = getByText('Submit');
        fireEvent.click(submitButton);
      });
      it('does not call the onSuccess handler', function () {
        strictEqual(onSuccessStub.callCount, 0);
      });
      it('does not call the onCancel handler', function () {
        strictEqual(onCancelStub.callCount, 0);
      });
      it('renders the error message', async function () {
        return result.findByRole('dialog');
      });
    });
  });
  describe('On Cancel Behavior', function () {
    beforeEach(function () {
      onSuccessStub = stub();
      onCancelStub = stub();
      ({ getByLabelText, getByText } = render(
        <FacultyAbsenceModal
          isVisible
          currentFaculty={appliedMathFacultyScheduleResponse}
          currentAbsence={facultyAbsenceRequest}
          onSuccess={onSuccessStub}
          onCancel={onCancelStub}
        />
      ));
      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);
    });
    it('calls the onCancel handler once', function () {
      strictEqual(onCancelStub.callCount, 1);
    });
    it('does not call the onSuccess handler', function () {
      strictEqual(onSuccessStub.callCount, 0);
    });
  });
});
