/**
 * Sets the offered status of a course instance for a given semester
 */
enum OFFERED {
  /**
   * The course **IS** being offered this semester, and normally would be
   */
  Y = 'Y',

  /**
   * The course is **NOT** being offered this semester, but usually would be
   */
  N = 'N',

  /**
   * The course is **NOT** being offered this semester and normally wouldn't be
   */
  BLANK = '',

  /**
   * The course is permanently retired and will not be offered going foward
   */
  RETIRED = 'RETIRED',
}

export default OFFERED;
