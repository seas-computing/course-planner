import { TERM } from 'common/constants';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';

interface semester {
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
  semester: semester
): string => {
  if (courseInstance && semester) {
    return semester.term === TERM.FALL
      ? `${
        courseInstance.catalogNumber
      }, ${
        semester.term
      } ${
        parseInt(semester.academicYear, 10) - 1
      }`
      : `${
        courseInstance.catalogNumber
      }, ${
        semester.term
      } ${
        semester.academicYear
      }`;
  }
  return '';
};
