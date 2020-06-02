/**
 * Represents possible values for the "Is Seas?" column on courses.
 */

enum IS_SEAS {
  /** This course is offered by SEAS */
  Y = 'Y',
  /** This course is not offered by SEAS */
  N = 'N',
  /** This course is offered by Earth & Planetary Sciences */
  EPS = 'EPS',
}

export default IS_SEAS;

/**
 * Helper function to get a cleaner text version of the enum value
 */

export const isSEASEnumToString = (isSEASEnum: IS_SEAS): string | null => {
  switch (isSEASEnum) {
    case IS_SEAS.Y:
      return 'Yes';
    case IS_SEAS.N:
      return 'No';
    case IS_SEAS.EPS:
      return 'EPS';
    default:
      return null;
  }
};
