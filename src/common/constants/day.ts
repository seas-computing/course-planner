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

export const dayEnumToString = (dayEnum: DAY): string => (
  {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
  }[dayEnum]
);
