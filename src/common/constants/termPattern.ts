/**
 * Specifies which semesters courses are offered in: Fall semester, Spring
 * semester, or both semesters
 */

enum TERM_PATTERN {

  /**
   * This course is offered in the fall semester only
   */
  FALL = 'FALL',

  /**
   * This course is offered in the spring semester only
   */
  SPRING = 'SPRING',

  /**
   * This course is offered in both the spring and the fall semester
   */
  BOTH = 'BOTH',
}

export default TERM_PATTERN;
