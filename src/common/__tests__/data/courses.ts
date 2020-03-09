import { Course } from 'server/course/course.entity';
import { TERM_PATTERN } from 'common/constants';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
/**
 * Empty instance of a [[Course]] entity with no properties set. Useful for
 * testing that something of type `Course` was returned, or passed to a method
 */
export const emptyCourse = new Course();

/**
 * An example [[Course]] representing CS 50.
 */
export const computerScienceCourse = Object.assign(new Course(), {
  id: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
  area: {
    id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
    name: 'CS',
  },
  title: 'Introduction to Computer Science',
  prefix: 'CS',
  number: '050',
  termPattern: TERM_PATTERN.FALL,
  isUndergraduate: true,
});

export const createCourseDtoExample: CreateCourse = Object.assign(
  new Course(),
  {
    area: {
      id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
      name: 'CS',
    },
    title: 'Introduction to Computer Science',
    isSEAS: true,
    isUndergraduate: true,
    prefix: 'CS',
    number: '050',
    termPattern: TERM_PATTERN.FALL,
    sameAs: '',
    private: true,
  }
);

export const manageCourseResponseExample: ManageCourseResponseDTO = {
  id: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
  area: {
    id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
    name: 'CS',
  },
  title: 'Introduction to Computer Science',
  isSEAS: true,
  isUndergraduate: true,
  catalogNumber: 'CS 050',
  termPattern: TERM_PATTERN.FALL,
  sameAs: '',
  private: true,
};

export const anotherManageCourseResponseExample: ManageCourseResponseDTO = {
  id: 'q2je1111-21fd-23ht-z924-h25990671iw6',
  area: {
    id: 'b51adw12-4g10-2z0a-7871-k2041052g42x',
    name: 'AP',
  },
  title: 'Introduction to Physics',
  isSEAS: true,
  isUndergraduate: true,
  catalogNumber: 'AP 101',
  termPattern: TERM_PATTERN.SPRING,
  sameAs: '',
  private: true,
};
