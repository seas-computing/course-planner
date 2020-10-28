import { ABSENCE_TYPE, FACULTY_TYPE } from 'common/constants';

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
export const absenceEnumToTitleCase = (str: string): string => {
  const words = str.split('_');
  return words.map(
    (word): string => word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

/**
 * Define the map here to avoid a new object being created on each call to
 * [[absenceTitleCaseToEnum]]
 */
const absenceTitleCaseToEnumMap = {
  Sabbatical: ABSENCE_TYPE.SABBATICAL,
  'Sabbatical Eligible': ABSENCE_TYPE.SABBATICAL_ELIGIBLE,
  'Sabbatical Ineligible': ABSENCE_TYPE.SABBATICAL_INELIGIBLE,
  'Teaching Relief': ABSENCE_TYPE.TEACHING_RELIEF,
  'Research Leave': ABSENCE_TYPE.RESEARCH_LEAVE,
  'Parental Leave': ABSENCE_TYPE.PARENTAL_LEAVE,
  'No Longer Active': ABSENCE_TYPE.NO_LONGER_ACTIVE,
  Present: ABSENCE_TYPE.PRESENT,
};

/**
 * A helper function that converts the faculty absence from the title case format
 * to the absence enum format
 */
export const absenceTitleCaseToEnum = (absence: string):
ABSENCE_TYPE => absenceTitleCaseToEnumMap[absence] as ABSENCE_TYPE;

/**
 * Define the map here to avoid a new object being created on each call to
 * [[facultyTypeEnumToTitleCase]]
 */
const facultyTypeEnumToTitleCaseMap = {
  [FACULTY_TYPE.LADDER]: 'Ladder',
  [FACULTY_TYPE.NON_SEAS_LADDER]: 'Non-SEAS Ladder',
  [FACULTY_TYPE.NON_LADDER]: 'Non-Ladder',
};

/**
 * A helper function that converts the faculty category enum into the desired
 * format for the Faculty table
 */
export const facultyTypeEnumToTitleCase = (facultyType: FACULTY_TYPE):
string => facultyTypeEnumToTitleCaseMap[facultyType];
