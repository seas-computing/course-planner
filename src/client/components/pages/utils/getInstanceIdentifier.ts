import { TERM } from 'common/constants';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { toTitleCase } from 'common/utils/util';

interface Semester {
  term: TERM,
  academicYear: string,
}

/**
 * Generates the text to identify the course and term/year information for a
 * specific course instance and semester. This is frequently used as the
 * text in modal headers.
 */
export const getInstanceIdentifier = (
  courseInstance: CourseInstanceResponseDTO,
  semester: Semester
): string => {
  if (courseInstance && semester) {
    return semester.term.toUpperCase() === TERM.FALL
      ? `${
        courseInstance.catalogNumber
      }, ${
        toTitleCase(semester.term)
      } ${
        parseInt(semester.academicYear, 10) - 1
      }`
      : `${
        courseInstance.catalogNumber
      }, ${
        toTitleCase(semester.term)
      } ${
        semester.academicYear
      }`;
  }
  return '';
};
