import {
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
  render,
  wait,
} from 'test-utils';
import request from 'client/api/request';
import {
  appliedMathFacultyScheduleResponse,
  facultyAbsence,
  metadata,
} from 'testData';
import FacultyAbsenceModal from '../FacultyAbsenceModal';

describe('Faculty Absence Modal', function () {
  let queryAllByRole: BoundFunction<AllByRole>;
  let getByLabelText: BoundFunction<GetByText>;
  let getByText: BoundFunction<GetByText>;
  const dispatchMessage: SinonStub = stub();
  let onSuccessStub: SinonStub;
  let onCloseStub: SinonStub;
  let putStub: SinonStub;
  describe('On Open Behavior', function () {
    beforeEach(function () {
      ({ getByLabelText, queryAllByRole } = render(
        <FacultyAbsenceModal
          isVisible
          currentFaculty={appliedMathFacultyScheduleResponse}
          currentAbsence={facultyAbsence}
        />,
        dispatchMessage,
        metadata
      ));
    });
    it('populates the absence field according to the current absence selected', function () {
      const absenceSelect = getByLabelText('Sabbatical/Leave', { exact: false }) as HTMLSelectElement;
      strictEqual(
        absenceSelect.value,
        facultyAbsence.type
      );
    });
    it('renders no error messages prior to initial form submission', function () {
      strictEqual(queryAllByRole('alert').length, 0);
    });
  });
  describe('Submit Behavior', function () {
    beforeEach(function () {
      putStub = stub(request, 'put');
      putStub.resolves({ data: facultyAbsence });
      onSuccessStub = stub();
      onCloseStub = stub();
      ({ getByLabelText, getByText } = render(
        <FacultyAbsenceModal
          isVisible
          currentFaculty={appliedMathFacultyScheduleResponse}
          currentAbsence={facultyAbsence}
          onSuccess={onSuccessStub}
          onClose={onCloseStub}
        />,
        dispatchMessage,
        metadata
      ));
      const absenceSelect = getByLabelText('Sabbatical/Leave', { exact: false }) as HTMLSelectElement;
      fireEvent.change(
        absenceSelect,
        { target: { value: facultyAbsence.type } }
      );
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
    });
    it('calls the onSuccess handler once on submit', async function () {
      await wait(() => strictEqual(onSuccessStub.callCount, 1));
    });
    it('calls the onSuccess handler with the provided arguments', async function () {
      await wait(() => strictEqual(
        onSuccessStub.args[0][0],
        facultyAbsence
      ));
    });
    it('calls the onClose handler once', async function () {
      await wait(() => strictEqual(onCloseStub.callCount, 1));
    });
  });
});
