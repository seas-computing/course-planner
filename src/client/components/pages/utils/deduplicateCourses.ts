import { FacultyCourse } from 'common/dto/faculty/FacultyResponse.dto';

/**
 * Computes a list of unique courses to prevent duplicate courses from showing
 */
export const deduplicateCourses = (courses: FacultyCourse[]): string[] => {
  const uniqueCourses: string[] = [];
  courses.forEach((course) => {
    if (uniqueCourses.indexOf(course.catalogNumber) === -1) {
      uniqueCourses.push(course.catalogNumber);
      // Only parse the sameAs value if there is one
      if (course.sameAs !== '') {
        const sameAsCourses = course.sameAs.split(', ');
        sameAsCourses.forEach((sameAsCourse) => {
          if (uniqueCourses.indexOf(sameAsCourse) === -1) {
            uniqueCourses.push(sameAsCourse);
          }
        });
      }
    }
  });
  return uniqueCourses;
};
