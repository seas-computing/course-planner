/**
 * Set list of days on which a [[Meeting]] can be scheduled to occur
 */
enum DAY {
  /** Monday */
  MON = 'MON',
  /** Tuesday */
  TUE = 'TUE',
  /** Wednesday */
  WED = 'WED',
  /** Thursday */
  THU = 'THU',
  /** Friday */
  FRI = 'FRI'
}

export default DAY;

/**
 * Helper function to get the full name of the day from the enum value
 */

export const dayEnumToString = (dayEnum: DAY): string => {
  switch (dayEnum) {
    case DAY.MON:
      return 'Monday';
    case DAY.TUE:
      return 'Tuesday';
    case DAY.WED:
      return 'Wednesday';
    case DAY.THU:
      return 'Thursday';
    case DAY.FRI:
      return 'Friday';
    default:
      return null;
  }
};

/**
 * An array of days that guarantees the order from Monday to Friday.
 */
export const days = [DAY.MON, DAY.TUE, DAY.WED, DAY.THU, DAY.FRI];
