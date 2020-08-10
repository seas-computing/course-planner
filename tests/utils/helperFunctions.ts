import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';

interface FacultyScheduleResponse {
  [key: string]: FacultyResponseDTO[];
}

/**
 * Account for the way null is sorted in SQL.
 * In SQL, nulls are ordered last by default.
 * I.e., if `a` is not null (or undefined) and b is null (or undefined)
 * or if `a` is less than `b`,
 * then `a` is sorted before `b`.
 * @param a The first value
 * @param b The second value
 * @return true if `a` is sorted before `b`, false otherwise
*/
export const sqlBefore = (a: string, b: string):
boolean => (a !== null && b === null) || a < b;

/**
 * Account for the way null is sorted in SQL.
 * In SQL, nulls are ordered last by default.
 * I.e., if `a` is null (or undefined) and b is not null (or undefined)
 * or if `a` is greater than `b`,
 * then `a` is sorted after `b`.
 * @param a The first value
 * @param b The second value
 * @return true if `a` is sorted after `b`, false otherwise
*/
export const sqlAfter = (a: string, b: string):
boolean => (a === null && b !== null) || a > b;

/**
 * Sorts by area, then last name, and finally by first name.
 * @param result The object whose keys will be sorted
 */
export const sortResults = (result: Record<string, FacultyResponseDTO[]>): {
  [key: string]: FacultyResponseDTO[];
} => {
  const sorted = {};
  Object.entries(result).forEach(([key, value]): void => {
    sorted[key] = value.slice().sort((a, b): number => {
      if (sqlBefore(a.area, b.area)) {
        return -1;
      } if (sqlAfter(a.area, b.area)) {
        return 1;
      } if (a.lastName < b.lastName) {
        return -1;
      } if (a.lastName > b.lastName) {
        return 1;
      } if (a.firstName < b.firstName) {
        return -1;
      }
      return 0;
    });
  });
  return sorted;
};

/**
 * Verifies that the academic years within faculty data returned matches the
 * expected years (based on what years were requested)
 * @param result The object whose academic year values will be checked
 */
export const allDataValidYears = (result: FacultyScheduleResponse): boolean => (
  Object.entries(result)
    .every(([year, dtos]) => (
      dtos.every((faculty) => (
        faculty.fall.academicYear.toString() === year
          && faculty.spring.academicYear.toString() === year
      ))
    ))
);
