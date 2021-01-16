import { Course } from 'server/course/course.entity';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { UpdateCourseDTO } from 'common/dto/courses/UpdateCourse.dto';
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

/**
 * An example of [[CreateCourse]] representing CS 50
 */
export const createCourseDtoExample: CreateCourse = Object.assign(
  new Course(),
  {
    area: {
      id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
      name: 'CS',
    },
    title: 'Introduction to Computer Science',
    isSEAS: IS_SEAS.Y,
    isUndergraduate: true,
    prefix: 'CS',
    number: '050',
    termPattern: TERM_PATTERN.FALL,
    sameAs: '',
    private: true,
  }
);

/**
 * An example [[ManageCourseResponseDTO]] response representing CS 50.
 */
export const computerScienceCourseResponse: ManageCourseResponseDTO = {
  id: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
  area: {
    id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
    name: 'CS',
  },
  title: 'Introduction to Computer Science',
  isSEAS: IS_SEAS.Y,
  isUndergraduate: true,
  catalogNumber: 'CS 050',
  termPattern: TERM_PATTERN.FALL,
  sameAs: '',
  private: true,
};

/**
 * An example [[ManageCourseResponseDTO]] response representing AP 295a.
 */
export const physicsCourseResponse: ManageCourseResponseDTO = {
  id: 'a1a13689-a925-4d0b-a4fc-21c93263c6d2',
  area: {
    id: '2213e1f8-31be-4e67-be06-a1eabd32ee0a',
    name: 'AP',
  },
  title: 'Introduction to Quantum Theory of Solids',
  isSEAS: IS_SEAS.Y,
  isUndergraduate: true,
  catalogNumber: 'AP 295a',
  termPattern: TERM_PATTERN.SPRING,
  sameAs: '',
  private: true,
};

/**
 * An example [[ManageCourseResponseDTO]] response representing a course with a non-existing area
 */
export const newAreaCourseResponse: ManageCourseResponseDTO = {
  id: 'a1a13689-a925-4d0b-a4fc-21c93263c6d3',
  area: {
    id: '2213e1f8-31be-4e67-be06-a1eabd32ee0b',
    name: 'NA',
  },
  title: 'Introduction to New Area',
  isSEAS: IS_SEAS.Y,
  isUndergraduate: true,
  catalogNumber: 'NA 100',
  termPattern: TERM_PATTERN.SPRING,
  sameAs: '',
  private: true,
};

/**
 * An example [[UpdateCourseDTO]] response representing CS 50
 */
export const updateCourseExample: UpdateCourseDTO = {
  area: {
    id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
    name: 'CS',
  },
  title: 'Introduction to Computer Science',
  prefix: 'CS',
  number: '050',
  termPattern: TERM_PATTERN.FALL,
  sameAs: '',
  isUndergraduate: true,
  isSEAS: IS_SEAS.Y,
  private: true,
};

/**
 * A collection of catalog prefix data, as returned by the database query in
 * [[CourseService#getCatalogPrefixList]]
 */
export const rawCatalogPrefixList = [
  { name: 'AC' },
  { name: 'AM' },
  { name: 'AP' },
  { name: 'BE' },
  { name: 'CS' },
  { name: 'EE' },
  { name: 'ESE' },
  { name: 'General' },
  { name: 'Mat & ME' },
  { name: 'MDE' },
  { name: 'MSMBA' },
  { name: 'SEM' },
];
