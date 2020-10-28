import React from 'react';
import {
  strictEqual,
} from 'assert';
import {
  waitForElement,
  wait,
  fireEvent,
  BoundFunction,
  FindByText,
  QueryByText,
  GetByText,
} from '@testing-library/react';
import {
  stub,
  SinonStub,
} from 'sinon';
import { FacultyAPI } from 'client/api/faculty';
import {
  appliedMathFacultyMemberResponse,
  appliedMathFacultyScheduleResponse,
  electricalEngineeringFacultyScheduleResponse,
} from 'testData';
import { render } from 'test-utils';
import FacultyScheduleTable from 'client/components/pages/Faculty/FacultyScheduleTable';
import { ABSENCE_TYPE } from 'common/constants';

describe('Faculty Schedule Modal Behavior', function () {
  let getStub: SinonStub;
  let putStub: SinonStub;
  const testData = [
    appliedMathFacultyScheduleResponse,
    electricalEngineeringFacultyScheduleResponse,
  ];
  const acadYear = testData[0].fall.academicYear;
  // make sure the data is all the same academic year
  testData.forEach((response) => {
    strictEqual(response.fall.academicYear, acadYear);
  });
  beforeEach(function () {
    getStub = stub(FacultyAPI, 'getFacultySchedulesForYear');
    getStub.resolves(testData);
  });
  describe('rendering', function () {
    context('when an edit faculty button has been clicked', function () {
      let findByText: BoundFunction<FindByText>;
      let queryByText: BoundFunction<QueryByText>;
      let getByLabelText: BoundFunction<GetByText>;
      let editAppliedMathSpringAbsenceButton: HTMLElement;
      beforeEach(async function () {
        putStub = stub(FacultyAPI, 'updateFacultyAbsence');
        putStub.resolves({ data: appliedMathFacultyMemberResponse });
        ({ findByText, queryByText, getByLabelText } = render(
          <FacultyScheduleTable
            academicYear={acadYear}
            facultySchedules={testData}
          />,
          (): void => {}
        )
        );
        // show the edit faculty modal
        editAppliedMathSpringAbsenceButton = await waitForElement(
          () => document
            .getElementById(`editAbsence${appliedMathFacultyScheduleResponse.id}SPRING`)
        );
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
