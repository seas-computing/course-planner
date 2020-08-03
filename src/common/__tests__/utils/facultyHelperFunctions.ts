import { FACULTY_TYPE } from 'common/constants';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';

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
string => {
  return facultyTypeEnumToTitleCaseMap[facultyType];
};

/**
 * Define the map here to avoid a new object being created on each call to
 * [[facultyTypeTitleCaseToEnum]]
 */
const facultyTypeTitleCaseToEnumMap = {
  Ladder: FACULTY_TYPE.LADDER,
  'Non-SEAS Ladder': FACULTY_TYPE.NON_SEAS_LADDER,
  'Non-Ladder': FACULTY_TYPE.NON_LADDER,
};

/**
 * A helper function that converts from the faculty from the title case format
 * to the category enum format
 */
export const facultyTypeTitleCaseToEnum = function (facultyType: string):
FACULTY_TYPE {
  return facultyTypeTitleCaseToEnumMap[facultyType];
};

/**
 * Sorts faculty by area, last name, and first name
 */
export const sortFaculty = (faculty: ManageFacultyResponseDTO[]):
ManageFacultyResponseDTO[] => faculty.slice()
  .sort((member1, member2): number => {
    if (member1.area.name < member2.area.name) {
      return -1;
    }
    if (member1.area.name > member2.area.name) {
      return 1;
    }
    if (member1.lastName < member2.lastName) {
      return -1;
    }
    if (member1.lastName > member2.lastName) {
      return 1;
    }
    if (member1.firstName < member2.firstName) {
      return -1;
    }
    if (member1.firstName > member2.firstName) {
      return 1;
    }
    return 0;
  });
