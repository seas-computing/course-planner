import { Course } from 'server/course/course.entity';
import { TERM_PATTERN } from 'common/constants';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { Area } from 'server/area/area.entity';

/**
 * Empty instance of a [[Course]] entity with no properties set. Useful for
 * testing that something of type `Course` was returned, or passed to a method
 */
export const emptyCourse = new Course();

/**
 * An example [[Course]] representing CS 50.
 */
export const computerScienceCourse = Object.assign(new Course(), {
  title: 'Introduction to Computer Science',
  prefix: 'CS',
  number: '050',
  termPattern: TERM_PATTERN.FALL,
  isUndergraduate: true,
} as Course);

export const createCourseDtoExample: CreateCourse = Object.assign(
  new Course(),
  {
    title: 'Introduction to Computer Science',
    isSEAS: true,
    isUndergraduate: true,
    prefix: 'CS',
    number: '050',
    termPattern: TERM_PATTERN.FALL,
    sameAs: '',
  }
);
