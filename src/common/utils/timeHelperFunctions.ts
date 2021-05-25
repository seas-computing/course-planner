/**
 * A helper function that takes a 12 hour time string (e.g. '04:32 AM', '12:30 PM')
 * and converts it to 24 hour time for the purpose of passing the 24 hour time
 * string to the HTML time input element to appropriately display meeting times
 */
export const convert12To24HourTime = (twelveHourTime: string): string => {
  const [time, period] = twelveHourTime.split(' ');
  const splitTime = time.split(':');
  let hour = splitTime[0];
  const minute = splitTime[1];
  /**
   * This accounts for the edge cases of midnight (12:00 AM) and noon (12:00 PM).
   * For noon, 12 is added back to the hour portion of time in the following
   * conditional statement given that the period is PM.
   */
  if (hour === '12') {
    hour = '00';
  }
  if (period === 'PM') {
    hour = (parseInt(hour, 10) + 12).toString();
  }
  return `${hour}:${minute}`;
};
