import { TERM } from 'common/constants';
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
