/**
 * Set categories that specify roles of faculty
 */

enum FACULTY_TYPE {
  /**
   * The term ladder faculty refers to tenured full professors as well as
   * tenure-track professorial faculty (assistant and associate professors).
   *
   * See {@link https://www.seas.harvard.edu/faculty-research/people/ladder}
   * for more information
   */
  LADDER = 'LADDER',

  /**
   * The term non-ladder faculty refers to those holding term-limited
   * instructional and teaching appointments. These include professors of the
   * practice, preceptors, senior preceptors, lecturers, senior lecturers, as
   * well as visiting faculty.
   *
   * See {@link https://www.seas.harvard.edu/faculty-research/people/nonladder}
   * for more information
   */
  NON_LADDER = 'NON_LADDER',

  /**
   * A member of [[LADDER]] faculty, whose primary job area is outside SEAS
   * (for example a member of ladder faculty who works for FAS).
   */
  NON_SEAS_LADDER = 'NON_SEAS_LADDER',
}

export default FACULTY_TYPE;
