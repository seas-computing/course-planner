import React from 'react';
import {
  appliedMathFacultyScheduleResponse,
  metadata,
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
  wait,
  GetByText,
  AllByRole,
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
import { ABSENCE_TYPE, FACULTY_TYPE, TERM } from 'common/constants';
import { absenceEnumToTitleCase, facultyTypeEnumToTitleCase } from 'common/utils/facultyHelperFunctions';
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
      const academicYearDropdown = getByLabelText('Select Academic Year');
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
        getByLabelText('Select Academic Year'),
        {
          target: {
            value: `${nextAcademicYear}`,
          },
        }
      );
      strictEqual(getStub.args[1][0], nextAcademicYear);
    });
  });
  describe('Filtering data', function () {
    let metadataContext: MetadataContextValue;
    let getByLabelText: BoundFunction<GetByText>;
    let getAllByRole: BoundFunction<AllByRole>;
    let queryAllByRole: BoundFunction<AllByRole>;
    const testFacultySchedules = [
      dummy.appliedMathFacultyScheduleResponse,
      dummy.electricalEngineeringFacultyScheduleResponse,
      dummy.computerScienceFacultyScheduleResponse,
    ];
    const areaFilterLabel = /^(?=.*\bfilter\b)(?=.*\barea\b).*$/i;
    const lastNameLabel = /^(?=.*\bfilter\b)(?=.*\blast\b).*$/i;
    const firstNameLabel = /^(?=.*\bfilter\b)(?=.*\bfirst\b).*$/i;
    const categoryLabel = /^(?=.*\bfilter\b)(?=.*\bcategory\b).*$/i;
    const fallAbsenceLabel = /^(?=.*\bfilter\b)(?=.*\bfall\b).*$/i;
    const springAbsenceLabel = /^(?=.*\bfilter\b)(?=.*\bspring\b).*$/i;
    beforeEach(async function () {
      getStub.resolves(testFacultySchedules);
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
      ({ getByLabelText, getAllByRole, queryAllByRole } = render(
        <FacultySchedule />, { metadataContext }
      ));
      await wait(() => getAllByRole('row').length > 3);
    });
    describe('Area Filter', function () {
      context('when no filters have been changed', function () {
        it('should default to the value "All"', function () {
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils
            .queryByLabelText(areaFilterLabel) as HTMLSelectElement;
          strictEqual(filter.value, 'All');
        });
        it('should show all of the areas and "All" as options', function () {
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils
            .queryByLabelText(areaFilterLabel) as HTMLSelectElement;
          const options = within(filter)
            .getAllByRole('option') as HTMLOptionElement[];
          const actualOptions = options
            .map(({ textContent }) => textContent);
          const expectedOptions = metadata.areas;
          // The default value of the area dropdown is 'All'
          expectedOptions.unshift('All');
          deepStrictEqual(actualOptions, expectedOptions);
        });
        it('should show all the rows', function () {
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows containing the area selected', function () {
          const testArea = testFacultySchedules[0].area;
          const filter = getByLabelText(areaFilterLabel);
          fireEvent.change(
            filter,
            {
              target: {
                value: testArea,
              },
            }
          );
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.area === testArea).length;
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          const actualNumRows = tableBodyRows.map((row) => (
            row.textContent
          )).length;
          strictEqual(expectedNumRows, actualNumRows);
        });
      });
    });
    describe('Last Name Filter', function () {
      context('when no filters have been changed', function () {
        it('should show all the rows', function () {
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows with last names matching the filters', function () {
          const testLastName = testFacultySchedules[0].lastName;
          const filter = getByLabelText(lastNameLabel);
          fireEvent.change(
            filter,
            {
              target: {
                value: testLastName,
              },
            }
          );
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.lastName === testLastName).length;
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          const actualNumRows = tableBodyRows.map((row) => (
            row.textContent
          )).length;
          strictEqual(expectedNumRows, actualNumRows);
        });
      });
    });
    describe('First Name Filter', function () {
      context('when no filters have been changed', function () {
        it('should show all the rows', function () {
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows with first names matching the filters', function () {
          const testFirstName = testFacultySchedules[0].firstName;
          const filter = getByLabelText(firstNameLabel);
          fireEvent.change(
            filter,
            {
              target: {
                value: testFirstName,
              },
            }
          );
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.firstName === testFirstName).length;
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          const actualNumRows = tableBodyRows.map((row) => (
            row.textContent
          )).length;
          strictEqual(expectedNumRows, actualNumRows);
        });
      });
    });
    describe('Category Filter', function () {
      context('when no filters have been changed', function () {
        it('should show all the rows', function () {
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
        it('should show all of the categories and "All" as options', function () {
          const filter = getByLabelText('Change to filter the faculty list by category') as HTMLSelectElement;
          const options = within(filter)
            .getAllByRole('option') as HTMLOptionElement[];
          const actualOptions = options
            .map(({ textContent }) => textContent);
          const expectedOptions = Object.values(FACULTY_TYPE).map((type) => (
            facultyTypeEnumToTitleCase(type)
          ));
          // The default value of the area dropdown is 'All'
          expectedOptions.unshift('All');
          deepStrictEqual(actualOptions, expectedOptions);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows with the category matching the filter', function () {
          const testCategory = testFacultySchedules[0].category;
          const filter = getByLabelText(categoryLabel);
          fireEvent.change(
            filter,
            {
              target: {
                value: testCategory,
              },
            }
          );
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.category === testCategory).length;
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          const actualNumRows = tableBodyRows.map((row) => (
            row.textContent
          )).length;
          strictEqual(expectedNumRows, actualNumRows);
        });
      });
    });
    describe('Fall Absence Filter', function () {
      context('when no filters have been changed', function () {
        it('should default to the value "All"', function () {
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils
            .queryByLabelText(fallAbsenceLabel) as HTMLSelectElement;
          strictEqual(filter.value, 'All');
        });
        it('should show all of the absence types and "All" as options', function () {
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils
            .queryByLabelText(fallAbsenceLabel) as HTMLSelectElement;
          const options = within(filter)
            .getAllByRole('option') as HTMLOptionElement[];
          const actualOptions = options
            .map(({ textContent }) => textContent);
          const expectedOptions = Object.values(ABSENCE_TYPE).map((type) => (
            absenceEnumToTitleCase(type)
          ));
          // The default value of the area dropdown is 'All'
          expectedOptions.unshift('All');
          deepStrictEqual(actualOptions, expectedOptions);
        });
        it('should show all the rows', function () {
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows matching the fall absence value selected', function () {
          const testAbsence = testFacultySchedules[0].fall.absence.type;
          const filter = getByLabelText(fallAbsenceLabel);
          fireEvent.change(
            filter,
            {
              target: {
                value: testAbsence,
              },
            }
          );
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.fall.absence.type
            === testAbsence).length;
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          const actualNumRows = tableBodyRows.map((row) => (
            row.textContent
          )).length;
          strictEqual(expectedNumRows, actualNumRows);
        });
      });
    });
    describe('Spring Absence Filter', function () {
      context('when no filters have been changed', function () {
        it('should default to the value "All"', function () {
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils
            .queryByLabelText(springAbsenceLabel) as HTMLSelectElement;
          strictEqual(filter.value, 'All');
        });
        it('should show all of the absence types and "All" as options', function () {
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils
            .queryByLabelText(springAbsenceLabel) as HTMLSelectElement;
          const options = within(filter)
            .getAllByRole('option') as HTMLOptionElement[];
          const actualOptions = options
            .map(({ textContent }) => textContent);
          const expectedOptions = Object.values(ABSENCE_TYPE).map((type) => (
            absenceEnumToTitleCase(type)
          ));
          // The default value of the area dropdown is 'All'
          expectedOptions.unshift('All');
          deepStrictEqual(actualOptions, expectedOptions);
        });
        it('should show all the rows', function () {
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows matching the spring absence value selected', function () {
          const testAbsence = testFacultySchedules[0].spring.absence.type;
          const filter = getByLabelText(springAbsenceLabel);
          fireEvent.change(
            filter,
            {
              target: {
                value: testAbsence,
              },
            }
          );
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.spring.absence.type
          === testAbsence).length;
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          const actualNumRows = tableBodyRows.map((row) => (
            row.textContent
          )).length;
          strictEqual(expectedNumRows, actualNumRows);
        });
      });
    });
  });
});
