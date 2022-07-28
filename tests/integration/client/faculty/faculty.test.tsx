import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  wait,
  fireEvent,
  BoundFunction,
  FindByText,
  QueryByText,
  GetByText,
  renderWithMessaging,
} from 'test-utils';
import {
  stub,
  SinonStub,
} from 'sinon';
import { FacultyAPI } from 'client/api/faculty';
import {
  appliedMathFacultyScheduleResponse,
  facultyAbsenceResponse,
} from 'testData';
import { ABSENCE_TYPE } from 'common/constants';
import FacultySchedule from 'client/components/pages/Faculty/FacultyPage';

describe('Faculty Schedule Modal Behavior', function () {
  let getStub: SinonStub;
  let putStub: SinonStub;
  const testData = [appliedMathFacultyScheduleResponse];
  const acadYear = testData[0].fall.academicYear;
  it('draws from test data from the same academic year', function () {
    testData.forEach((response) => {
      strictEqual(response.fall.academicYear, acadYear);
    });
  });
  beforeEach(function () {
    getStub = stub(FacultyAPI, 'getFacultySchedulesForYear');
    getStub.resolves(testData);
  });
  describe('rendering', function () {
    let findByText: BoundFunction<FindByText>;
    let queryByText: BoundFunction<QueryByText>;
    let getByLabelText: BoundFunction<GetByText>;
    let editAppliedMathFallAbsenceButton: HTMLElement;
    let editAppliedMathSpringAbsenceButton: HTMLElement;
    beforeEach(function () {
      putStub = stub(FacultyAPI, 'updateFacultyAbsence');
      putStub.resolves({ data: facultyAbsenceResponse });
      ({
        findByText,
        queryByText,
        getByLabelText,
      } = renderWithMessaging(
        <FacultySchedule />
      )
      );
    });
    context('when a Fall semester edit faculty button has been clicked', function () {
      beforeEach(async function () {
        // show the edit faculty modal
        editAppliedMathFallAbsenceButton = getByLabelText('edit faculty fall absence');
        fireEvent.click(editAppliedMathFallAbsenceButton);
        await findByText('Sabbatical/Leave');
      });
      context('when the absence modal is opened', function () {
        it('sets the focus on the modal header', function () {
          strictEqual((document.activeElement as HTMLElement).textContent.includes('Sabbatical/Leave'), true);
        });
      });
      context('when the "Present" absence value option is selected and the form is submitted', function () {
        it('renders in the dropdown with the label "None"', async function () {
          const absenceSelect = getByLabelText('Sabbatical/Leave', { exact: false }) as HTMLSelectElement;
          fireEvent.change(absenceSelect, { target: { value: `${ABSENCE_TYPE.PRESENT}` } });
          const submitButton = await findByText('Submit', { exact: false });
          fireEvent.click(submitButton);
          await wait(() => !queryByText('Sabbatical/Leave', { exact: false }));
          // Reopen the modal to check the dropdown selected item
          editAppliedMathFallAbsenceButton = getByLabelText('edit faculty fall absence');
          fireEvent.click(editAppliedMathFallAbsenceButton);
          await findByText('Sabbatical/Leave');
          strictEqual(
            absenceSelect.selectedOptions[0].text,
            'None'
          );
        });
      });
      context('when the absence modal is closed', function () {
        it('returns focus to the original edit faculty button', async function () {
          const cancelButton = await findByText('Cancel', { exact: false });
          // close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText('Sabbatical/Leave', { exact: false }));
          strictEqual(
            document.activeElement as HTMLElement,
            editAppliedMathFallAbsenceButton
          );
        });
      });
      context('when the absence modal is submitted', function () {
        it('should show a success message', async function () {
          const submitButton = await findByText('Submit', { exact: false });
          fireEvent.click(submitButton);
          await wait(() => !queryByText('Sabbatical/Leave for', { exact: false }));
          return findByText('Faculty absence was updated', { exact: false });
        });
      });
    });
    context('when a Spring semester edit faculty button has been clicked', function () {
      beforeEach(async function () {
        // show the edit faculty modal
        editAppliedMathSpringAbsenceButton = getByLabelText('edit faculty spring absence');
        fireEvent.click(editAppliedMathSpringAbsenceButton);
        await findByText('Sabbatical/Leave');
      });
      context('when the absence modal is opened', function () {
        it('sets the focus on the modal header', function () {
          strictEqual((document.activeElement as HTMLElement).textContent.includes('Sabbatical/Leave'), true);
        });
      });
      context('when the "Present" absence value option is selected and the form is submitted', function () {
        it('renders in the dropdown with the label "None"', async function () {
          const absenceSelect = getByLabelText('Sabbatical/Leave', { exact: false }) as HTMLSelectElement;
          fireEvent.change(absenceSelect, { target: { value: `${ABSENCE_TYPE.PRESENT}` } });
          const submitButton = await findByText('Submit', { exact: false });
          fireEvent.click(submitButton);
          await wait(() => !queryByText('Sabbatical/Leave', { exact: false }));
          // Reopen the modal to check the dropdown selected item
          editAppliedMathSpringAbsenceButton = getByLabelText('edit faculty spring absence');
          fireEvent.click(editAppliedMathSpringAbsenceButton);
          await findByText('Sabbatical/Leave');
          strictEqual(
            absenceSelect.selectedOptions[0].text,
            'None'
          );
        });
      });
      context('when the absence modal is closed', function () {
        it('returns focus to the original edit faculty button', async function () {
          const cancelButton = await findByText('Cancel', { exact: false });
          // close the modal
          fireEvent.click(cancelButton);
          await wait(() => !queryByText('Sabbatical/Leave', { exact: false }));
          strictEqual(
            document.activeElement as HTMLElement,
            editAppliedMathSpringAbsenceButton
          );
        });
      });
    });
  });
});
