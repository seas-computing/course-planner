import { deepStrictEqual, strictEqual } from 'assert';
import {
  NUM_SEMESTERS,
  NUM_YEARS,
  TERM,
} from 'common/constants';
import { metadata } from 'testData';
import { stub } from 'sinon';
import * as multiYearPlan from '../multiYearPlanHelperFunctions';
import { calculateSemesters } from '../multiYearPlanHelperFunctions';

describe('Multi-Year Plan Helper Functions', function () {
  describe('calculateSemesters', function () {
    it('returns the requested number of semesters', function () {
      const actual = calculateSemesters(
        metadata.currentAcademicYear, NUM_SEMESTERS
      );
      strictEqual(actual.length, NUM_SEMESTERS);
    });
    it('returns the correct terms', function () {
      const years = Array(NUM_YEARS);
      const terms = [TERM.FALL, TERM.SPRING];
      const expectedTerms = [].concat(...years.fill(terms));
      const actualTerms = multiYearPlan.calculateSemesters(
        metadata.currentAcademicYear,
        NUM_SEMESTERS
      ).map((semester) => semester.term);
      deepStrictEqual(actualTerms, expectedTerms);
    });
    it('returns the expected academic years', function () {
      const expectedSemesterAcademicYears = [2021, 2021, 2022, 2022,
        2023, 2023, 2024, 2024];
      const actualAcademicYears = multiYearPlan.calculateSemesters(
        metadata.currentAcademicYear,
        NUM_SEMESTERS
      ).map((semester) => semester.academicYear);
      deepStrictEqual(actualAcademicYears, expectedSemesterAcademicYears);
    });
    it('returns the expected calendar years', function () {
      const startingAcademicYear = 2021;
      const numSemesters = 8;
      const expectedCalendarYears = [2020, 2021, 2021, 2022,
        2022, 2023, 2023, 2024];

      const actualCalendarYears = multiYearPlan.calculateSemesters(
        startingAcademicYear,
        numSemesters
      ).map((semester) => semester.calendarYear);
      deepStrictEqual(actualCalendarYears, expectedCalendarYears);
    });
    it('returns the expected keys', function () {
      const startingAcademicYear = 2021;
      const numYears = 4;
      const academicYears = [2021, 2021, 2022, 2022, 2023, 2023, 2024, 2024];
      const expectedKeys = academicYears
        .map(
          (year, index) => (index % 2 === 0
            ? `${year}-${TERM.FALL}`
            : `${year}-${TERM.SPRING}`)
        );
      const actualKeys = multiYearPlan
        .calculateSemesters(startingAcademicYear, numYears * 2)
        .map((semester) => semester.key);
      deepStrictEqual(actualKeys, expectedKeys);
    });
  });
  describe('getSemestersFromYear', function () {
    it('calls calculateSemesters() with the right arguments', function () {
      const calculateSemestersStub = stub(multiYearPlan, 'calculateSemesters');
      multiYearPlan.getSemestersFromYear(2021);
      deepStrictEqual(calculateSemestersStub.args[0], [2021, NUM_SEMESTERS]);
    });
  });
});
