import { DAY } from '../../constants';
import { ScheduleViewResponseDTO } from '../../dto/schedule/schedule.dto';

/**
 * A fake set of data for the Schedule interface in the UI
 */
export const testCourseScheduleData: ScheduleViewResponseDTO[] = [
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
        instanceId: 'da806338-6ad8-4e54-a49e-f25d9c29da38',
        courseNumber: '165',
        isUndergraduate: true,
        campus: 'Cambridge',
        room: 'LISE Lab for Integrated Science &amp; Engr LISE_300_Third Floor Open Area',
      },
      {
        id: '737fda78-bae4-49ea-b166-96218b642dfe',
        instanceId: '51000705-1754-419d-8d5d-ddd599058f84',
        courseNumber: '282r',
        isUndergraduate: false,
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
        instanceId: '7988f5f6-f45d-4b70-ab54-437ab7fa0737',
        courseNumber: '121',
        isUndergraduate: true,
        campus: 'Cambridge',
        room: 'Bauer Laboratory Bauer G18 SCRB Lobby',
      },
    ],
  },
  {
    id: 'CSWED09001015FALL2018',
    coursePrefix: 'CS',
    weekday: DAY.WED,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 15,
    duration: 75,
    courses: [
      {
        id: 'b97a0c74-3034-4856-bbc8-e7624070ddcc',
        instanceId: 'da806338-6ad8-4e54-a49e-f25d9c29da38',
        courseNumber: '165',
        isUndergraduate: true,
        campus: 'Cambridge',
        room: 'LISE Lab for Integrated Science &amp; Engr LISE_300_Third Floor Open Area',
      },
      {
        id: 'c4b7b26b-6acf-43e7-8ba2-cbb21c28063e',
        instanceId: '51000705-1754-419d-8d5d-ddd599058f84',
        courseNumber: '282r',
        isUndergraduate: false,
        campus: 'Cambridge',
        room: 'Science Center ScienceCtr_Hall D',
      },
    ],
  },
  {
    id: 'CSFRI09001015FALL2018',
    coursePrefix: 'CS',
    weekday: DAY.FRI,
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 15,
    duration: 75,
    courses: [
      {
        id: '58e2d8a0-38e6-49ad-9f86-e8f932b3036a',
        instanceId: 'da806338-6ad8-4e54-a49e-f25d9c29da38',
        courseNumber: '165',
        isUndergraduate: true,
        campus: 'Cambridge',
        room: 'LISE Lab for Integrated Science &amp; Engr LISE_300_Third Floor Open Area',
      },
      {
        id: '168ad602-f328-4168-876f-b9ab8754e7e2',
        instanceId: '51000705-1754-419d-8d5d-ddd599058f84',
        courseNumber: '282r',
        isUndergraduate: false,
        campus: 'Cambridge',
        room: 'Science Center ScienceCtr_Hall D',
      },
    ],
  },
];
