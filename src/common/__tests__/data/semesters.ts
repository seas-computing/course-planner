import { Semester, TERM } from 'server/semester/semester.entity';

/**
 * The first [[Semester]] of academic year 2019. This [[Semester]] is part of
 * the same academic year as [[spring]]
 */
export const fall: Semester = {
  id: '',
  academicYear: 2019,
  term: TERM.FALL,
  absences: [],
  courseInstances: [],
  nonClassEvents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * The second [[Semester]] of academic year 2019. This [[Semester]] is part of
 * the same academic year as [[spring]]
 */
export const spring: Semester = {
  id: '',
  academicYear: 2020,
  term: TERM.SPRING,
  absences: [],
  courseInstances: [],
  nonClassEvents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
