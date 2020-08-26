import React from 'react';
import {
  appliedMathFacultyScheduleResponse,
  electricalEngineeringFacultyScheduleResponse,
  newAreaFacultyScheduleResponse,
} from 'common/data/faculty';
import {
  render,
  BoundFunction,
  AllByRole,
  getRoles,
} from 'common/utils';
import { strictEqual } from 'assert';
import {
  waitForElement,
  wait,
  GetByText,
} from '@testing-library/react';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import {
  SinonStub,
  stub,
} from 'sinon';
import request from 'axios';
import { error } from 'common/data';
import {
  absenceEnumToTitleCase,
  facultyTypeEnumToTitleCase,
} from 'common/utils/facultyHelperFunctions';
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
          />,
          (): void => {}
        )
        );
      });
      it('renders two rows of headers', function () {
        const allRows = getAllByRole('row');
        const headerRows = allRows.filter((row) => {
          const roles = getRoles(row);
          return 'columnheader' in roles && roles.columnheader.length > 0;
        });
        strictEqual(headerRows.length, 2);
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
          />,
          (): void => {}
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
        strictEqual(allRows.length, facultyScheduleList.length + 2);
      });
      it('displays the correct content in the table cells', async function () {
        await wait(() => getAllByRole('row').length > 2);
        const rows = Array.from(getAllByRole('row')) as HTMLTableRowElement[];
        const rowsContent = rows
          .map(
            (row) => (Array.from(row.cells).map((cell) => cell.textContent))
          );
        assertRowMatchesResponse(rowsContent[2],
          appliedMathFacultyScheduleResponse);
        assertRowMatchesResponse(rowsContent[3],
          electricalEngineeringFacultyScheduleResponse);
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
        dispatchMessage
      );
      await wait(() => getAllByRole('row').length === emptyTestData.length + 2);
      strictEqual(dispatchMessage.callCount, 1);
    });
  });
});
