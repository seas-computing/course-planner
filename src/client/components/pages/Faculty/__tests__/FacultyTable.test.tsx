import React from 'react';
import {
  appliedMathFacultyScheduleResponse,
  electricalEngineeringFacultyScheduleResponse,
  newAreaFacultyScheduleResponse,
  error,
} from 'testData';
import {
  render,
  BoundFunction,
  AllByRole,
  getRoles,
} from 'test-utils';
import { strictEqual } from 'assert';
import * as dummy from 'testData';
import {
  waitForElement,
  wait,
  GetByText,
  RenderResult,
  within,
  fireEvent,
} from '@testing-library/react';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import {
  SinonStub,
  stub,
} from 'sinon';
import request from 'axios';
import {
  absenceEnumToTitleCase,
  facultyTypeEnumToTitleCase,
} from 'common/utils/facultyHelperFunctions';
import { ABSENCE_TYPE } from 'common/constants';
import FacultySchedule from '../FacultyPage';
import FacultyScheduleTable from '../FacultyScheduleTable';

/**
 * Helper function used to compare table row contents with faculty schedule data
 */
const assertRowMatchesResponse = function (
  row: string[],
  response: FacultyResponseDTO
): void {
  const [
    area,
    lastName,
    firstName,
    category,
    jointWith,
    fallAbsence,
    fallCourses,
    springAbsence,
    springCourses,
  ] = row;
  strictEqual(area, response.area);
  strictEqual(lastName, response.lastName);
  strictEqual(firstName, response.firstName);
  strictEqual(category, facultyTypeEnumToTitleCase(response.category));
  strictEqual(jointWith, response.jointWith);
  strictEqual(fallAbsence, absenceEnumToTitleCase(
    response.fall.absence.type
  ));
  strictEqual(fallCourses, response.fall.courses
    .map((course) => course.catalogNumber)
    .join(''));
  strictEqual(springAbsence, absenceEnumToTitleCase(
    response.spring.absence.type
  ));
  strictEqual(springCourses, response.spring.courses
    .map((course) => course.catalogNumber)
    .join(''));
};

describe('FacultyScheduleTable', function () {
  const facultyScheduleList = [
    appliedMathFacultyScheduleResponse,
    electricalEngineeringFacultyScheduleResponse,
    newAreaFacultyScheduleResponse,
  ];
  context('When faculty data fetch succeeds', function () {
    describe('Header Rows', function () {
      let getAllByRole: BoundFunction<AllByRole>;
      const acadYear = 2021;
      beforeEach(function () {
        ({ getAllByRole } = render(
          <FacultyScheduleTable
            academicYear={acadYear}
            facultySchedules={facultyScheduleList}
            onEdit={(): void => {}}
            editButtonRef={null}
          />
        )
        );
      });
      it('renders three rows of headers', function () {
        const allRows = getAllByRole('row');
        const headerRows = allRows.filter((row) => {
          const roles = getRoles(row);
          return 'columnheader' in roles && roles.columnheader.length > 0;
        });
        strictEqual(headerRows.length, 3);
      });
      it('renders the semesters into the top header row', function () {
        const [topRow] = getAllByRole('row');
        const { columnheader: [fallHeader, springHeader] } = getRoles(topRow);
        strictEqual(fallHeader.textContent, `Fall ${acadYear - 1}`);
        strictEqual(springHeader.textContent, `Spring ${acadYear}`);
      });
      it('renders the faculty schedule rows in the bottom header row', function () {
        const [, secondRow] = getAllByRole('row');
        const {
          columnheader: [
            areaHeader,
            lastNameHeader,
            firstNameHeader,
            categoryHeader,
            jointWithHeader,
            fallAbsenceHeader,
            fallCoursesHeader,
            springAbsenceHeader,
            springCoursesHeader,
          ],
        } = getRoles(secondRow);
        strictEqual(areaHeader.textContent, 'Area');
        strictEqual(lastNameHeader.textContent, 'Last Name');
        strictEqual(firstNameHeader.textContent, 'First Name');
        strictEqual(categoryHeader.textContent, 'Category');
        strictEqual(jointWithHeader.textContent, 'Joint With');
        strictEqual(fallAbsenceHeader.textContent, 'Sabbatical Leave');
        strictEqual(fallCoursesHeader.textContent, 'Courses');
        strictEqual(springAbsenceHeader.textContent, 'Sabbatical Leave');
        strictEqual(springCoursesHeader.textContent, 'Courses');
      });
    });
    describe('Table Body', function () {
      let getAllByRole: BoundFunction<AllByRole>;
      let getByText: BoundFunction<GetByText>;
      const acadYear = 2021;
      beforeEach(function () {
        ({ getAllByRole, getByText } = render(
          <FacultyScheduleTable
            academicYear={acadYear}
            facultySchedules={facultyScheduleList}
            onEdit={(): void => {}}
            editButtonRef={null}
          />
        )
        );
      });
      it('displays the correct faculty information', async function () {
        const { lastName } = electricalEngineeringFacultyScheduleResponse;
        return waitForElement(() => getByText(lastName));
      });
      it('displays the correct number of rows in the table', async function () {
        await wait(() => getAllByRole('row').length > 2);
        const allRows = getAllByRole('row');
        strictEqual(allRows.length, facultyScheduleList.length + 3);
      });
      it('displays the correct content in the table cells', async function () {
        await wait(() => getAllByRole('row').length > 2);
        const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
        const rowsContent = rows
          .map(
            (row) => (Array.from(row.cells).map((cell) => cell.textContent))
          );
          // When the absence type is ABSENCE_TYPE.PRESENT, the absence should
          // not display in the table cell. This function updates the expected
          // response to match the cell content.
        const filterOutPresentAbsences = (faculty: FacultyResponseDTO) => {
          const fallAbsence = faculty.fall.absence.type === ABSENCE_TYPE.PRESENT
            ? '' : faculty.fall.absence.type;
          const springAbsence = faculty.spring.absence.type
          === ABSENCE_TYPE.PRESENT
            ? '' : faculty.spring.absence.type;
          return {
            ...faculty,
            fall: {
              ...faculty.fall,
              absence: {
                ...faculty.fall.absence,
                type: fallAbsence as ABSENCE_TYPE,
              },
            },
            spring: {
              ...faculty.spring,
              absence: {
                ...faculty.spring.absence,
                type: springAbsence as ABSENCE_TYPE,
              },
            },
          };
        };
        assertRowMatchesResponse(
          rowsContent[3],
          filterOutPresentAbsences(appliedMathFacultyScheduleResponse)
        );
        assertRowMatchesResponse(
          rowsContent[4],
          filterOutPresentAbsences(
            electricalEngineeringFacultyScheduleResponse
          )
        );
      });
      it('does not pass the backgroundColor prop when area does not exist', async function () {
        await wait(() => getAllByRole('row').length > 2);
        const newAreaStyle = window.getComputedStyle(getByText('NA'));
        strictEqual(newAreaStyle.backgroundColor, '');
      });
    });
  });
  context('When faculty data fetch fails', function () {
    let getStub: SinonStub;
    let dispatchMessage: SinonStub;
    const emptyTestData = [];
    beforeEach(function () {
      getStub = stub(request, 'get');
      dispatchMessage = stub();
      getStub.rejects(error);
    });
    afterEach(function () {
      getStub.restore();
    });
    it('should throw an error', async function () {
      const { getAllByRole } = render(
        <FacultySchedule />,
        { dispatchMessage }
      );
      await wait(() => getAllByRole('row').length === emptyTestData.length + 2);
      strictEqual(dispatchMessage.callCount, 1);
    });
  });
  describe('Filtering', function () {
    let renderResult: RenderResult;
    const testFacultySchedules = [
      dummy.appliedMathFacultyScheduleResponse,
      dummy.electricalEngineeringFacultyScheduleResponse,
      dummy.computerScienceFacultyScheduleResponse,
    ];
    beforeEach(function () {
      renderResult = render(
        <FacultyScheduleTable
          academicYear={2021}
          facultySchedules={testFacultySchedules}
          onEdit={(): void => {}}
          editButtonRef={null}
        />
      );
    });
    describe('Area Filter', function () {
      context('when no filters have been changed', function () {
        it('should default to the value "All"', async function () {
          const { getAllByRole } = renderResult;
          // Wait for there to be more than 3 rows since there are 3 header
          // rows in the Faculty Schedule table.
          await wait(() => getAllByRole('row').length > 3);
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils.queryByLabelText('Change to filter the faculty list by area') as HTMLSelectElement;
          strictEqual(filter.value, 'All');
        });
        it('should show all the rows', async function () {
          const { queryAllByRole, getAllByRole } = renderResult;
          await wait(() => getAllByRole('row').length > 3);
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows containing the area selected', async function () {
          const {
            queryAllByRole,
            getAllByRole,
            queryByLabelText,
          } = renderResult;
          const testArea = testFacultySchedules[0].area;
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.area === testArea).length;
          await wait(() => getAllByRole('row').length > 3);
          const filter = queryByLabelText('Change to filter the faculty list by area') as HTMLSelectElement;
          fireEvent.change(
            filter,
            {
              target: {
                value: testArea,
              },
            }
          );
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
        it('should show all the rows', async function () {
          const { queryAllByRole, getAllByRole } = renderResult;
          await wait(() => getAllByRole('row').length > 3);
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows with last names matching the filter', async function () {
          const {
            queryAllByRole,
            getAllByRole,
            queryByLabelText,
          } = renderResult;
          const testLastName = testFacultySchedules[0].lastName;
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.lastName === testLastName).length;
          await wait(() => getAllByRole('row').length > 3);
          const filter = queryByLabelText('Change to filter the faculty list by last name') as HTMLInputElement;
          fireEvent.change(
            filter,
            {
              target: {
                value: testLastName,
              },
            }
          );
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
        it('should show all the rows', async function () {
          const { queryAllByRole, getAllByRole } = renderResult;
          await wait(() => getAllByRole('row').length > 3);
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows with first names matching the filter', async function () {
          const {
            queryAllByRole,
            getAllByRole,
            queryByLabelText,
          } = renderResult;
          const testFirstName = testFacultySchedules[0].firstName;
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.firstName === testFirstName).length;
          await wait(() => getAllByRole('row').length > 3);
          const filter = queryByLabelText('Change to filter the faculty list by first name') as HTMLInputElement;
          fireEvent.change(
            filter,
            {
              target: {
                value: testFirstName,
              },
            }
          );
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
        it('should show all the rows', async function () {
          const { queryAllByRole, getAllByRole } = renderResult;
          await wait(() => getAllByRole('row').length > 3);
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows with category matching the filter', async function () {
          const {
            queryAllByRole,
            getAllByRole,
            queryByLabelText,
          } = renderResult;
          const testCategory = testFacultySchedules[0].category;
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.category === testCategory).length;
          await wait(() => getAllByRole('row').length > 3);
          const filter = queryByLabelText('Change to filter the faculty list by category') as HTMLSelectElement;
          fireEvent.change(
            filter,
            {
              target: {
                value: testCategory,
              },
            }
          );
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
        it('should default to the value "All"', async function () {
          const { getAllByRole } = renderResult;
          // Wait for there to be more than 3 rows since there are 3 header
          // rows in the Faculty Schedule table.
          await wait(() => getAllByRole('row').length > 3);
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils.queryByLabelText('Change to filter the faculty list by the fall absence value') as HTMLSelectElement;
          strictEqual(filter.value, 'All');
        });
        it('should show all the rows', async function () {
          const { queryAllByRole, getAllByRole } = renderResult;
          await wait(() => getAllByRole('row').length > 3);
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows containing the fall absence value selected', async function () {
          const {
            queryAllByRole,
            getAllByRole,
            queryByLabelText,
          } = renderResult;
          const testAbsence = testFacultySchedules[0].fall.absence.type;
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.fall.absence.type
            === testAbsence).length;
          await wait(() => getAllByRole('row').length > 3);
          const filter = queryByLabelText('Change to filter the faculty list by the fall absence value') as HTMLSelectElement;
          fireEvent.change(
            filter,
            {
              target: {
                value: testAbsence,
              },
            }
          );
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
        it('should default to the value "All"', async function () {
          const { getAllByRole } = renderResult;
          // Wait for there to be more than 3 rows since there are 3 header
          // rows in the Faculty Schedule table.
          await wait(() => getAllByRole('row').length > 3);
          const rows = getAllByRole('row');
          const utils = within(rows[2]);
          const filter = utils.queryByLabelText('Change to filter the faculty list by the spring absence value') as HTMLSelectElement;
          strictEqual(filter.value, 'All');
        });
        it('should show all the rows', async function () {
          const { queryAllByRole, getAllByRole } = renderResult;
          await wait(() => getAllByRole('row').length > 3);
          const tableBodyRows = queryAllByRole('row')
            .filter((row) => (
              within(row).queryAllByRole('columnheader').length === 0
            ));
          strictEqual(tableBodyRows.length, testFacultySchedules.length);
        });
      });
      context('when the filter is changed', function () {
        it('should show the rows containing the spring absence value selected', async function () {
          const {
            queryAllByRole,
            getAllByRole,
            queryByLabelText,
          } = renderResult;
          const testAbsence = testFacultySchedules[0].spring.absence.type;
          const expectedNumRows = testFacultySchedules
            .filter((faculty) => faculty.spring.absence.type
            === testAbsence).length;
          await wait(() => getAllByRole('row').length > 3);
          const filter = queryByLabelText('Change to filter the faculty list by the spring absence value') as HTMLSelectElement;
          fireEvent.change(
            filter,
            {
              target: {
                value: testAbsence,
              },
            }
          );
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
