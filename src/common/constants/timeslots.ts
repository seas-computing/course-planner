/**
 * A placeholder list of one hour meeting times to prepopulate the meeting modal
 * start and end times. This will be replaced with an official list of meeting
 * times in the future.
 */
export const meetingTimeSlots = [
  '08:00 AM-09:00 AM',
  '09:00 AM-10:00 AM',
  '10:00 AM-11:00 AM',
  '11:00 AM-12:00 PM',
  '01:00 PM-02:00 PM',
  '02:00 PM-03:00 PM',
  '03:00 PM-04:00 PM',
  '04:00 PM-05:00 PM',
  '05:00 PM-06:00 PM',
  '06:00 PM-07:00 PM',
  '07:00 PM-08:00 PM',
];

/**
 * A helper function that calculates the start and end times given the defined
 * meetingTimeSlots, which is an array of strings (e.g. ['08:00 AM-09:00 AM',
 * '09:00 AM-10:00 AM']). This function is called each time a user selects a new
 * timeslot in the meeting modal to populate the adjacent start and end time
 * text input fields accordingly.
 */
export const calculateStartEndTimes = (timeslot: string):
{start: string, end: string} => {
  const times = timeslot.split('-');
  return {
    start: times[0],
    end: times[1],
  };
};
