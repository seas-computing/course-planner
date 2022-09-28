import { TERM } from 'common/constants';
import { Semester } from 'server/semester/semester.entity';
import { toTitleCase } from './util';

/**
 * A helper function that converts the [[TERM]] enum into title case
 * (e.g. 'FALL' becomes 'Fall')
 */
export const termEnumToTitleCase = (term: TERM): string => toTitleCase(term);

/**
 * Returns the terms that follow a given term in the same academic year.
 * NOTE: If the TERM enum is altered, this function should be too.
 */
export const getFutureTerms = (term: TERM): TERM[] => {
  if (term === TERM.FALL) {
    return [TERM.SPRING];
  }
  return [];
};

/**
 * Calculate the academic year a [[Semester]] occurs in.
 *
 * Since the `academicYear` property of [[Semester]] objects is actually
 * calendar year, not academic year (despite the name). This helper function
 * exists to convert a [[Semester]] to a calendar year and abstract away the
 * annoying off-by-one math that goes with that.
 */
export const resolveAcademicYear = (semester: Partial<Semester>): number => (
  (semester.term === TERM.FALL)
    ? (parseInt(semester.academicYear, 10) + 1)
    : parseInt(semester.academicYear, 10)
);
