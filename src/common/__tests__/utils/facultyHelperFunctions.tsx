import { FACULTY_TYPE } from 'common/constants';

/**
  * Verifies whether the HUID provided meets the formatting requirements
  */
export const validHUID = (huid: string): boolean => (
  huid.length === 8 && /^\d+$/.test(huid)
);

/**
 * A helper function that converts the faculty absence enum into the desired
 * format for the Faculty table
 * The string is split on the hyphen and joined with a space. Only the first
 * letter of each word is capitalized.
 * (e.g. 'SABBATICAL_INELIGIBLE' becomes 'Sabbatical Ineligible')
 */
export const absenceEnumToTitleCase = function (str: string): string {
  const words = str.split('_');
  return words.map(
    (word): string => word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

/**
 * A helper function that converts the faculty category enum into the desired
 * format for the Faculty table
 */
export const categoryEnumToTitleCase = function (str: string): string {
  const result: string = {
    [FACULTY_TYPE.LADDER]: 'Ladder',
    [FACULTY_TYPE.NON_SEAS_LADDER]: 'Non-SEAS Ladder',
    [FACULTY_TYPE.NON_LADDER]: 'Non-Ladder',
  }[str];
  return result;
};
