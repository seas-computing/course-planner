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
  if (hour === '12' && period === 'AM') {
    hour = '00';
  }
  if (period === 'PM' && hour !== '12') {
    hour = (parseInt(hour, 10) + 12).toString();
  }
  // If hour is a single digit, add a 0 to the left to pad the hour
  if (hour.length === 1) {
    hour = hour.padStart(2, '0');
  }
  return `${hour}:${minute}`;
};

/**
 * A helper function that converts a time string into a user friendly format.
 * If the time provided is in a 12 hour time format, the time is returned without
 * a leading zero (e.g. '08:45 AM' becomes '8:45 AM').
 * If the time provided is in a 24 hour time format, it is converted into
 * 12 hour time format.
 */
export const convertTo12HourDisplayTime = (time: string): string => {
  // If the time provided is already in 12 hour time, return the time as is
  if (time.split(' ').length > 1) {
    // Remove leading zeroes if any
    return time.replace(/^0+/, '');
  }
  const splitTime = time.split(':');
  let hour = parseInt(splitTime[0], 10);
  const minute = splitTime[1];
  let period = 'AM';

  if (hour > 12) {
    hour -= 12;
    period = 'PM';
  }

  if (hour === 12) {
    period = 'PM';
  }

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${period}`;
};
