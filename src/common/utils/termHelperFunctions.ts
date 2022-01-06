import { TERM } from 'common/constants';
import { toTitleCase } from './util';

/**
 * A helper function that converts the [[TERM]] enum into title case
 * (e.g. 'FALL' becomes 'Fall')
 */
export const termEnumToTitleCase = (term: TERM): string => toTitleCase(term);
