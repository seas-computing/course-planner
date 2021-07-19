import React from 'react';
import { strictEqual } from 'assert';
import {
  render,
  BoundFunction,
  AllByRole,
  getRoles,
  within,
} from 'test-utils';
import {
  dataScienceReadingGroup,
  computationalModelingofFluidsReadingGroup,
} from 'testData';
import NonClassMeetingsTable from '../NonClassMeetingsTable';

describe('NonClassMeetings Table', function () {
  const academicYear = 2020;
  const nonClassMeetings = [
    dataScienceReadingGroup,
    computationalModelingofFluidsReadingGroup,
  ];
  describe('Header', function () {
    let getAllByRole: BoundFunction<AllByRole>;
    beforeEach(function () {
      ({ getAllByRole } = render(
        <NonClassMeetingsTable
          academicYear={academicYear}
          nonClassMeetingList={nonClassMeetings}
        />
      )
      );
    });
    it('Renders two rows of headers', function () {
      const headerRows = getAllByRole('row')
        .filter((row) => within(row).queryAllByRole('columnheader').length > 0);
      strictEqual(headerRows.length, 2);
    });
    it('Renders the semesters into the top header row', function () {
      const [topRow] = getAllByRole('row');
      const { columnheader: [fallHeader, springHeader] } = getRoles(topRow);
      strictEqual(fallHeader.textContent, `Fall ${academicYear - 1}`);
      strictEqual(springHeader.textContent, `Spring ${academicYear}`);
    });
  });
  describe('Table body', function () {
    let getAllByRole: BoundFunction<AllByRole>;
    beforeEach(function () {
      ({ getAllByRole } = render(
        <NonClassMeetingsTable
          academicYear={academicYear}
          nonClassMeetingList={nonClassMeetings}
        />
      )
      );
    });
    it('renders the non class meetings into the body', function () {
      const headerRows = getAllByRole('row')
        .filter((row) => within(row).queryAllByRole('columnheader').length > 0);
      strictEqual(headerRows.length, nonClassMeetings.length);
    });
  });
});
