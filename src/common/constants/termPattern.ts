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

/**
 * Helper function to get a cleaner text version of the enum value
 */

export const termPatternEnumToString = (termPatternEnum: TERM_PATTERN)
: string | null => {
  switch (termPatternEnum) {
    case TERM_PATTERN.BOTH:
      return 'Both';
    case TERM_PATTERN.FALL:
      return 'Fall';
    case TERM_PATTERN.SPRING:
      return 'Spring';
    default:
      return null;
  }
};
