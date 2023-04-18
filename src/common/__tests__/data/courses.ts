import { Course } from 'server/course/course.entity';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import { CreateCourse } from 'common/dto/courses/CreateCourse.dto';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { UpdateCourseDTO } from 'common/dto/courses/UpdateCourse.dto';
import { FindCoursesQueryResult } from 'server/course/course.service';
import { ActiveParentCourses } from 'common/dto/courses/ActiveParentCourses.dto';
/**
 * Empty instance of a [[Course]] entity with no properties set. Useful for
 * testing that something of type `Course` was returned, or passed to a method
 */
export const emptyCourse = new Course();

/**
 * An example [[Course]] representing CS 50.
 */
export const cs50Course = Object.assign(new Course(), {
  id: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
  area: {
    id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
    name: 'CS',
  },
  sameAs: null,
  title: 'Introduction to Computer Science',
  prefix: 'CS',
  number: '050',
  isSEAS: IS_SEAS.Y,
  termPattern: TERM_PATTERN.FALL,
  isUndergraduate: true,
});

/**
 * An example [[Course]] representing CS 200.
 */
export const cs200Course = Object.assign(new Course(), {
  id: '295976e9-3c36-4785-843e-84906668a924',
  area: {
    id: '735fb5ae-8716-4c53-8e07-b0dc5a2db24b',
    name: 'CS',
  },
  sameAs: null,
  title: 'Introduction to Computer Science',
  prefix: 'CS',
  number: '200',
  isSEAS: IS_SEAS.Y,
  termPattern: TERM_PATTERN.SPRING,
  isUndergraduate: true,
});

/**
 * An example [[Course]] representing AP 295a.
 */
export const physicsCourse = Object.assign(new Course(), {
  id: 'a1a13689-a925-4d0b-a4fc-21c93263c6d2',
  area: {
    id: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
    name: 'AP',
  },
  title: 'Introduction to Quantum Theory of Solids',
  prefix: 'AP',
  number: '295a',
  isSEAS: IS_SEAS.Y,
  termPattern: TERM_PATTERN.SPRING,
  isUndergraduate: true,
});

/**
 * An example of [[CreateCourse]] representing CS 50
 */
export const createCourseDtoExample: CreateCourse = {
  area: cs50Course.area.name,
  title: cs50Course.title,
  isSEAS: cs50Course.isSEAS,
  isUndergraduate: cs50Course.isUndergraduate,
  prefix: cs50Course.prefix,
  number: cs50Course.number,
  termPattern: cs50Course.termPattern,
  sameAs: cs50Course.sameAs,
  private: cs50Course.private,
};

/**
 * An example [[ManageCourseResponseDTO]] response representing CS 50.
 */
export const computerScienceCourseResponse: ManageCourseResponseDTO = {
  id: 'b8bc8456-51fd-48ef-b111-5a5990671cd1',
  area: {
    id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
    name: createCourseDtoExample.area,
  },
  title: createCourseDtoExample.title,
  isSEAS: createCourseDtoExample.isSEAS,
  isUndergraduate: createCourseDtoExample.isUndergraduate,
  prefix: createCourseDtoExample.prefix,
  number: createCourseDtoExample.number,
  catalogNumber: `${createCourseDtoExample.prefix} ${createCourseDtoExample.number}`,
  termPattern: createCourseDtoExample.termPattern,
  sameAs: createCourseDtoExample.sameAs,
  private: createCourseDtoExample.private,
};

/**
 * An example [[FindCoursesQueryResult]] response representing CS 50.
 */
export const computerScienceCourseQueryResult: FindCoursesQueryResult = {
  id: computerScienceCourseResponse.id,
  areaId: computerScienceCourseResponse.area.id,
  areaName: computerScienceCourseResponse.area.name,
  title: computerScienceCourseResponse.title,
  isSEAS: computerScienceCourseResponse.isSEAS,
  isUndergraduate: computerScienceCourseResponse.isUndergraduate,
  prefix: computerScienceCourseResponse.prefix,
  number: computerScienceCourseResponse.number,
  catalogNumber: computerScienceCourseResponse.catalogNumber,
  termPattern: computerScienceCourseResponse.termPattern,
  sameAs: computerScienceCourseResponse.sameAs,
  private: computerScienceCourseResponse.private,
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
  prefix: 'AP',
  number: '295a',
  catalogNumber: 'AP 295a',
  termPattern: TERM_PATTERN.SPRING,
  sameAs: null,
  private: true,
};

/**
 * An example [[FindCoursesQueryResult]] response representing AP 295a.
 */
export const physicsCourseQueryResult: FindCoursesQueryResult = {
  id: physicsCourseResponse.id,
  areaId: physicsCourseResponse.area.id,
  areaName: physicsCourseResponse.area.name,
  title: physicsCourseResponse.title,
  isSEAS: physicsCourseResponse.isSEAS,
  isUndergraduate: physicsCourseResponse.isUndergraduate,
  prefix: physicsCourseResponse.prefix,
  number: physicsCourseResponse.number,
  catalogNumber: physicsCourseResponse.catalogNumber,
  termPattern: physicsCourseResponse.termPattern,
  sameAs: physicsCourseResponse.sameAs,
  private: physicsCourseResponse.private,
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
  prefix: 'NA',
  number: '100',
  catalogNumber: 'NA 100',
  termPattern: TERM_PATTERN.SPRING,
  sameAs: null,
  private: true,
};

/**
 * An example [[UpdateCourseDTO]] response representing CS 50
 */
export const updateCourseExample: UpdateCourseDTO = {
  id: cs50Course.id,
  area: cs50Course.area.name,
  title: cs50Course.title,
  prefix: cs50Course.prefix,
  number: cs50Course.number,
  termPattern: cs50Course.termPattern,
  sameAs: cs50Course.sameAs,
  isUndergraduate: cs50Course.isUndergraduate,
  isSEAS: cs50Course.isSEAS,
  private: cs50Course.private,
};

/**
 * A collection of catalog prefix data, as returned by the database query in
 * [[CourseService#getCatalogPrefixList]]
 */
export const rawCatalogPrefixList = [
  { prefix: 'AC' },
  { prefix: 'AM' },
  { prefix: 'AP' },
  { prefix: 'BE' },
  { prefix: 'CS' },
  { prefix: 'ES' },
  { prefix: 'ESE' },
  { prefix: 'GENED' },
  { prefix: 'SEMINAR' },
];

/**
 * An example [[ActiveParentCourses[]]] response
 */
export const activeParentCoursesExample: ActiveParentCourses[] = [
  { id: 'd32921eb-acec-424d-8be3-60ed3a8e2996', catalogNumber: 'AC 209a' },
  { id: '17c85af5-5b74-4202-8332-2604cd114b51', catalogNumber: 'AM 22b' },
  { id: '5fc4f4ba-e1ff-4b3b-8ae4-45edc7b2c578', catalogNumber: 'AM 108' },
  { id: '84ce8fa2-6184-472c-9f51-6f47bdb1a3bd', catalogNumber: 'AP 242' },
  {
    id: physicsCourseResponse.id,
    catalogNumber: physicsCourseResponse.catalogNumber,
  },
  { id: 'f4a148df-f36e-4bd5-8998-59207046e88a', catalogNumber: 'BE 153' },
  { id: '3f29ad8e-6163-45ae-bdce-9706e9fe30aa', catalogNumber: 'BE 191' },
  {
    id: computerScienceCourseResponse.id,
    catalogNumber: computerScienceCourseResponse.catalogNumber,
  },
  { id: '65bcdf61-de97-4758-ab16-8920d0b571dc', catalogNumber: 'CS 10' },
  { id: '98a61a51-4280-4624-8bdc-c67a3b527c2d', catalogNumber: 'CS 288r' },
  { id: 'dad6a49e-02be-4d1a-8cb2-016cd902b585', catalogNumber: 'ES 212' },
  { id: 'b9a40bf7-56fa-4410-a377-5b0521910842', catalogNumber: 'GENED 1094' },
  {
    id: newAreaCourseResponse.id,
    catalogNumber: newAreaCourseResponse.catalogNumber,
  },
  { id: 'c5ceb64c-ddc2-49bf-9616-7a611d07ebf6', catalogNumber: 'SEMINAR AP Colloqium' },
];
