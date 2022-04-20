/**
 * Sets the offered status of a course instance for a given semester
 */
enum OFFERED {
  /**
   * The course is **NOT** being offered this semester and normally wouldn't be
   */
  BLANK = '',

  /**
   * The course **IS** being offered this semester, and normally would be
   */
  Y = 'Y',

  /**
   * The course is **NOT** being offered this semester, but usually would be
   */
  N = 'N',

  /**
   * The course is permanently retired and will not be offered going foward
   */
  RETIRED = 'RETIRED',
}

export default OFFERED;

/**
 * Helper function to get a cleaner text version of the enum value
 */

export const offeredEnumToString = (offeredEnum: OFFERED): string | null => {
  switch (offeredEnum) {
    case OFFERED.Y:
      return 'Yes';
    case OFFERED.N:
      return 'No';
    case OFFERED.BLANK:
      return '';
    case OFFERED.RETIRED:
      return 'Retired';
    default:
      return null;
  }
};
