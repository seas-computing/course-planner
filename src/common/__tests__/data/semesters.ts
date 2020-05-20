import { Semester } from 'server/semester/semester.entity';
import { TERM } from 'common/constants';

/**
 * The first [[Semester]] of academic year 2020. This [[Semester]] is part of
 * the same academic year as [[spring]]
 */
export const fall: Semester = {
  id: '',
  academicYear: '2020',
  term: TERM.FALL,
  absences: [],
  courseInstances: [],
  nonClassEvents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * The second [[Semester]] of academic year 2020. This [[Semester]] is part of
 * the same academic year as [[spring]]
 */
export const spring: Semester = {
  id: '',
  academicYear: '2020',
  term: TERM.SPRING,
  absences: [],
  courseInstances: [],
  nonClassEvents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * A collection of year data, as returned by the database query in
 * [[SemesterService#getYearList]]
 */
export const rawYearList = [
  { year: '2018' },
  { year: '2019' },
  { year: '2020' },
  { year: '2021' },

];
/**
 * A collection of semester data, as returned by the database query in
 * [[SemesterService#getSemesterList]]
 */
export const rawSemesterList = [
  { term: 'FALL', year: 2018 },
  { term: 'SPRING', year: 2018 },
  { term: 'FALL', year: 2019 },
  { term: 'SPRING', year: 2019 },
  { term: 'FALL', year: 2020 },
  { term: 'SPRING', year: 2020 },
  { term: 'FALL', year: 2021 },
  { term: 'SPRING', year: 2021 },
  { term: 'FALL', year: 2022 },
];
