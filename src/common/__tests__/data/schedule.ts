import { DAY } from '../../constants';

/**
 * A fake set of data for the Schedule interface in the UI
 */
export const testCourseScheduleData = [
  {
    id: 'CSMON09001015FALL2018',
    coursePrefix: 'CS',
    weekday: DAY.MON,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 15,
    duration: 75,
    courses: [
      {
        id: '0b4adc13-5a53-489d-97e5-8cce379148a7',
        courseNumber: '165',
        isUndergraduate: true,
        startTime: '09:00 AM',
        endTime: '10:15 AM',
        campus: 'Cambridge',
        room: 'LISE Lab for Integrated Science &amp; Engr LISE_300_Third Floor Open Area',
      },
      {
        id: '737fda78-bae4-49ea-b166-96218b642dfe',
        courseNumber: '282r',
        isUndergraduate: false,
        startTime: '09:00 AM',
        endTime: '10:15 AM',
        campus: 'Cambridge',
        room: 'Science Center ScienceCtr_Hall D',
      },
    ],
  },
  {
    id: 'ESMON09001015FALL2018',
    coursePrefix: 'ES',
    weekday: DAY.MON,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 15,
    duration: 75,
    courses: [
      {
        id: 'b234a6d1-2ade-45bc-91fb-690ca41877f9',
        courseNumber: '121',
        isUndergraduate: true,
        startTime: '09:00 AM',
        endTime: '10:15 AM',
        campus: 'Cambridge',
        room: 'Bauer Laboratory Bauer G18 SCRB Lobby',
      },
    ],
  },
];
