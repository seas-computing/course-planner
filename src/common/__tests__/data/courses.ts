import { Course } from 'server/course/course.entity';
import { TERM_PATTERN } from 'common/constants';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';

/**
 * Empty instance of a [[Course]] entity with no properties set. Useful for
 * testing that something of type `Course` was returned, or passed to a method
 */
export const emptyCourse = new Course();

/**
 * An example [[Course]] representing CS 50.
 */
export const computerScienceCourse: Course = {
  ...new Course(),
  catalogNumber: 'CS 050',
  prefix: 'CS',
  number: '050',
  termPattern: TERM_PATTERN.BOTH,
};

export const createCourseDtoExample: CreateCourse = {
  ...computerScienceCourse as CreateCourse,
};
