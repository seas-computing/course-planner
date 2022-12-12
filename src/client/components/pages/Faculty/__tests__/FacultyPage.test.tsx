import React from 'react';
import {
  appliedMathFacultyScheduleResponse,
  notActiveACSFacultyScheduleResponse,
  partiallyActiveAMFacultyScheduleResponse,
} from 'testData';
import {
  render,
  BoundFunction,
  FindByText,
  QueryByText,
  fireEvent,
  within,
  GetByText,
} from 'test-utils';
import { deepStrictEqual, strictEqual } from 'assert';
import {
  SinonStub,
  spy,
  stub,
} from 'sinon';
import * as dummy from 'testData';
import { FacultyAPI } from 'client/api';
import { MetadataContextValue } from 'client/context';
import { TERM } from 'common/constants';
import FacultySchedule from '../FacultyPage';

describe('Faculty Page', function () {
  let getStub: SinonStub;
  const currentAcademicYear = 2021;
  beforeEach(function () {
    getStub = stub(FacultyAPI, 'getFacultySchedulesForYear');
  });
  describe('fetching data on render', function () {
    context('When API request succeeds', function () {
      let findByText: BoundFunction<FindByText>;
      let findByLabelText: BoundFunction<FindByText>;
      let queryByText: BoundFunction<QueryByText>;
      beforeEach(function () {
        getStub.resolves([
          { ...appliedMathFacultyScheduleResponse },
          { ...notActiveACSFacultyScheduleResponse },
          { ...partiallyActiveAMFacultyScheduleResponse },
        ]);
        ({
          findByText,
          findByLabelText,
          queryByText,
        } = render(<FacultySchedule />));
      });
      it('calls the fetch function on render', function () {
        strictEqual(getStub.callCount, 1);
      });
      it('does not show the retired faculty', async function () {
        // First, make sure that the Show Retired checkbox is not initially checked
        const retiredCheckbox = await findByLabelText('Show "No Longer Active" Faculty', { exact: false }) as HTMLInputElement;
        strictEqual(retiredCheckbox.checked, false, 'The "Show Retired" checkbox is checked when it should initially be unchecked');
        strictEqual(
          queryByText(notActiveACSFacultyScheduleResponse.lastName), null
        );
      });
      it('show faculty that are not retired in all semesters', async function () {
        // First, make sure that the Show Retired checkbox is not initially checked
        const retiredCheckbox = await findByLabelText('Show "No Longer Active" Faculty', { exact: false }) as HTMLInputElement;
        strictEqual(retiredCheckbox.checked, false, 'The "Show Retired" checkbox is checked when it should initially be unchecked');
        return findByText(partiallyActiveAMFacultyScheduleResponse.firstName);
      });
      it('shows the retired faculty', async function () {
        // First, make sure that the Show Retired checkbox is not initially checked
        const retiredCheckbox = await findByLabelText('Show "No Longer Active" Faculty', { exact: false }) as HTMLInputElement;
        strictEqual(retiredCheckbox.checked, false, 'The "Show Retired" checkbox is checked when it should initially be unchecked');
        fireEvent.click(retiredCheckbox);
        return findByText(notActiveACSFacultyScheduleResponse.firstName);
      });
    });
  });
  describe('Navigating academic years', function () {
    let metadataContext: MetadataContextValue;
    let getByLabelText: BoundFunction<GetByText>;
    beforeEach(function () {
      getStub.resolves([
        { ...appliedMathFacultyScheduleResponse },
        { ...notActiveACSFacultyScheduleResponse },
        { ...partiallyActiveAMFacultyScheduleResponse },
      ]);
      metadataContext = new MetadataContextValue({
        ...dummy.metadata,
        currentAcademicYear,
        semesters: [
          `${TERM.FALL} 2020`,
          `${TERM.SPRING} 2021`,
          `${TERM.FALL} 2021`,
          `${TERM.SPRING} 2022`,
        ],
      },
      spy());
      ({ getByLabelText } = render(
        <FacultySchedule />, { metadataContext }
      ));
    });
    it('requests data for the current academic year on initial render', function () {
      strictEqual(getStub.args[0][0], currentAcademicYear);
    });
    it('populates the academic year dropdown', function () {
      const academicYearDropdown = getByLabelText('Academic Year');
      const dropdownOptions = within(academicYearDropdown)
        .getAllByRole('option') as HTMLOptionElement[];
      const dropdownLabels = dropdownOptions
        .map(({ textContent }) => textContent);
      deepStrictEqual(
        dropdownLabels,
        [
          'Fall 2020 - Spring 2021',
          'Fall 2021 - Spring 2022',
        ]
      );
      const dropdownValues = dropdownOptions
        .map(({ value }) => value);
      deepStrictEqual(
        dropdownValues,
        ['2021', '2022']
      );
    });
    it('fetches new data when changing academic years', function () {
      const nextAcademicYear = currentAcademicYear + 1;
      strictEqual(getStub.args[0][0], currentAcademicYear);
      fireEvent.change(
        getByLabelText('Academic Year'),
        {
          target: {
            value: `${nextAcademicYear}`,
          },
        }
      );
      strictEqual(getStub.args[1][0], nextAcademicYear);
    });
  });
});
