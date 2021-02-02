import { NUM_SEMESTERS, TERM } from 'common/constants';

export interface SemesterInfo {
  term: TERM;
  academicYear: number;
  calendarYear: number;
  key: string;
}

/**
 * Gets the list of semesters for the multi-year plan table starting with the
 * given year and specified number of semesters.
 * This function was separated from getSemestersFromYear to allow easier unit
 * testing.
 */
export const calculateSemesters = (
  startingAcademicYear: number,
  numSemesters: number
):
SemesterInfo[] => Array.from({ length: numSemesters }, (_, i: number) => {
  const term = i % 2 === 0 ? TERM.FALL : TERM.SPRING;
  const academicYear = startingAcademicYear + Math.floor(i / 2);
  const calendarYear = term === TERM.FALL ? academicYear - 1 : academicYear;
  const key = `${academicYear}-${term}`;
  return {
    term,
    academicYear,
    calendarYear,
    key,
  };
});

/**
 * Gets the list of semesters for the multi-year plan table starting with the
 * given year by calling calculateSemesters with the numSemesters set to
 * the constant NUM_SEMESTERS.
 */
export const getSemestersFromYear = (startingAcademicYear: number):
SemesterInfo[] => calculateSemesters(startingAcademicYear, NUM_SEMESTERS);
