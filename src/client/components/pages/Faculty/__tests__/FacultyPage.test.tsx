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
} from 'test-utils';
import { strictEqual } from 'assert';
import {
  SinonStub,
  stub,
} from 'sinon';
import { FacultyAPI } from 'client/api';
import FacultySchedule from '../FacultyPage';

describe('Faculty Page', function () {
  let getStub: SinonStub;
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
          queryByText(notActiveACSFacultyScheduleResponse.area), null
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
});
