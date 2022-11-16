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
  waitForElementToBeRemoved,
  RenderResult,
  within,
} from 'test-utils';
import {
  stub,
  SinonStub,
} from 'sinon';
import { FacultyAPI } from 'client/api/faculty';
import {
  appliedMathFacultyScheduleResponse,
} from 'testData';
import { ABSENCE_TYPE } from 'common/constants';
import FacultySchedule from 'client/components/pages/Faculty/FacultyPage';
import { absenceEnumToTitleCase } from 'common/utils/facultyHelperFunctions';

describe('Faculty Schedule Modal Behavior', function () {
  let getStub: SinonStub;
  let putStub: SinonStub<
  Parameters<typeof FacultyAPI['updateFacultyAbsence']>,
  ReturnType<typeof FacultyAPI['updateFacultyAbsence']>
  >;
  const testData = [
    appliedMathFacultyScheduleResponse,
  ];
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
    let page: RenderResult;
    beforeEach(function () {
      putStub = stub(FacultyAPI, 'updateFacultyAbsence');
      putStub.resolves(testData[0].fall.absence);
      page = renderWithMessaging(<FacultySchedule />);
      ({ findByText, queryByText, getByLabelText } = page);
      const nlaCheckbox = page
        .getByLabelText(`Show "${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)}" Faculty`) as HTMLInputElement;
      if (!nlaCheckbox.checked) {
        fireEvent.click(nlaCheckbox);
      }
    });
    context('when a Fall semester edit faculty button has been clicked', function () {
      beforeEach(async function () {
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
        let modal: HTMLDivElement;
        let submitButton: HTMLButtonElement;
        let dropdown: HTMLSelectElement;
        beforeEach(async function () {
          modal = await page.findByRole('dialog') as HTMLDivElement;
          submitButton = await within(modal)
            .findByText('Submit', { exact: false }) as HTMLButtonElement;
          dropdown = await within(modal)
            .findByRole('combobox') as HTMLSelectElement;
        });
        it('should show a success message', async function () {
          fireEvent.click(submitButton);
          await waitForElementToBeRemoved(
            () => page.queryByText('Sabbatical/Leave for', { exact: false })
          );
          return findByText('Faculty absence was updated', { exact: false });
        });
        it('updates absence data in place', async function () {
          const absenceType = ABSENCE_TYPE.RESEARCH_LEAVE;
          putStub.resolves({
            ...testData[0].fall.absence,
            type: absenceType,
          });
          fireEvent.change(dropdown, {
            target: { value: `${absenceType}` },
          });
          fireEvent.click(submitButton);
          await waitForElementToBeRemoved(
            () => page.queryByText('Sabbatical/Leave for', { exact: false })
          );
          const tableCell = editAppliedMathFallAbsenceButton.closest('td');
          return within(tableCell)
            .findByText(absenceEnumToTitleCase(absenceType));
        });
        describe(`going to ${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)}`, function () {
          beforeEach(function () {
            putStub.resolves({
              ...testData[0].fall.absence,
              type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
            });
          });
          it('updates spring and fall', async function () {
            fireEvent.change(
              dropdown,
              { target: { value: ABSENCE_TYPE.NO_LONGER_ACTIVE } }
            );
            fireEvent.click(submitButton);
            await waitForElementToBeRemoved(
              () => page.queryByText('Sabbatical/Leave for', { exact: false })
            );
            const tableRow = editAppliedMathFallAbsenceButton.closest('tr');
            const nlaAbsences = within(tableRow).queryAllByText(
              absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)
            );
            strictEqual(nlaAbsences.length, 2);
          });
        });
        describe(`going from ${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)}`, function () {
          beforeEach(async function () {
            fireEvent.click(editAppliedMathFallAbsenceButton);
            // Fake the return value of the API so that the absence in react state is NLA
            putStub.resolves({
              ...testData[0].fall.absence,
              type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
            });
            fireEvent.click(submitButton);
            await waitForElementToBeRemoved(
              () => page.queryByText('Sabbatical/Leave for', { exact: false })
            );
            fireEvent.click(editAppliedMathFallAbsenceButton);

            // Get a new reference to the modal (and submit button) because
            // closing the modal has broken the reference we had to the original
            // elements
            modal = await page.findByRole('dialog') as HTMLDivElement;
            submitButton = await within(modal)
              .findByText('Submit', { exact: false }) as HTMLButtonElement;

            putStub.resolves({
              ...testData[0].fall.absence,
              type: ABSENCE_TYPE.PARENTAL_LEAVE,
            });
          });
          it('updates fall to match the selected value', async function () {
            const value = ABSENCE_TYPE.PARENTAL_LEAVE;
            fireEvent.change(dropdown, { target: { value } });
            fireEvent.click(submitButton);
            await waitForElementToBeRemoved(
              () => page.queryByText('Sabbatical/Leave for', { exact: false })
            );
            const tableRow = editAppliedMathFallAbsenceButton.closest('tr');
            const [fall] = within(tableRow).getAllByRole('button')
              .map((button) => button.closest('td'));

            strictEqual(fall.textContent, absenceEnumToTitleCase(value));
          });
          it(`updates spring to ${absenceEnumToTitleCase(ABSENCE_TYPE.PRESENT)}`, async function () {
            const value = ABSENCE_TYPE.PARENTAL_LEAVE;
            fireEvent.change(dropdown, { target: { value } });
            fireEvent.click(submitButton);
            await waitForElementToBeRemoved(
              () => page.queryByText('Sabbatical/Leave for', { exact: false })
            );
            const tableRow = editAppliedMathFallAbsenceButton.closest('tr');
            const [,spring] = within(tableRow).getAllByRole('button')
              .map((button) => button.closest('td'));

            strictEqual(spring.textContent, '');
          });
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
      context('when the submit button is clicked', function () {
        let modal: HTMLDivElement;
        let submitButton: HTMLButtonElement;
        let dropdown: HTMLSelectElement;
        beforeEach(async function () {
          modal = await page.findByRole('dialog') as HTMLDivElement;
          submitButton = await within(modal)
            .findByText('Submit', { exact: false }) as HTMLButtonElement;
          dropdown = await within(modal)
            .findByRole('combobox') as HTMLSelectElement;
        });
        it('updates absence data in place', async function () {
          const absenceType = ABSENCE_TYPE.RESEARCH_LEAVE;
          putStub.resolves({
            ...testData[0].spring.absence,
            type: absenceType,
          });
          fireEvent.change(dropdown, {
            target: { value: `${absenceType}` },
          });
          fireEvent.click(submitButton);
          await waitForElementToBeRemoved(
            () => page.queryByText('Sabbatical/Leave for', { exact: false })
          );
          const tableCell = editAppliedMathSpringAbsenceButton.closest('td');
          return within(tableCell)
            .findByText(absenceEnumToTitleCase(absenceType));
        });
        describe(`going to ${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)}`, function () {
          it(`sets spring to ${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)}`, async function () {
            const value = ABSENCE_TYPE.NO_LONGER_ACTIVE;
            putStub.resolves({
              ...testData[0].spring.absence,
              type: value,
            });
            fireEvent.change(dropdown, { target: { value } });
            fireEvent.click(submitButton);
            await waitForElementToBeRemoved(
              () => page.queryByText('Sabbatical/Leave for', { exact: false })
            );
            const tableRow = editAppliedMathSpringAbsenceButton.closest('tr');
            const [,spring] = within(tableRow).getAllByRole('button')
              .map((button) => button.closest('td'));

            strictEqual(spring.textContent, absenceEnumToTitleCase(value));
          });
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
