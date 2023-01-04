import { DAY } from 'common/constants';
import { RoomScheduleResponseDTO } from 'common/dto/schedule/roomSchedule.dto';

/**
 * A fake set of data for the Room Schedule interface in the UI
 */
export const testRoomScheduleData: RoomScheduleResponseDTO[] = [
  {
    id: 'AM10MON10301200FALL2022',
    catalogNumber: 'AM 10',
    title: 'Applied Math for Computation',
    isUndergraduate: true,
    faculty: [
      {
        id: '5c8e015f-eae6-4586-9eb0-fc7d243403bf',
        displayName: 'Rogers, Chris',
        notes: 'Prefers room with whiteboard',
        instructorOrder: 1,
      },
      {
        id: 'effb8b1f-0525-42d0-bcbe-29206121d8ac',
        displayName: 'Waldo, James',
        notes: 'Prefers Allston campus',
        instructorOrder: 0,
      },
    ],
    weekday: DAY.MON,
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 30,
    duration: 150,
  },
  {
    id: 'CS226TUE10301230FALL2022',
    catalogNumber: 'CS 226',
    title: 'Sketching Algorithms for Big Data',
    isUndergraduate: false,
    faculty: [
      {
        id: '907bcf6a-7000-449d-ba54-16f9954ee4ba',
        displayName: 'Malan, David',
        notes: 'Prefers Cambridge campus',
        instructorOrder: 0,
      },
      {
        id: '1c852f5d-8b8c-46f5-87c9-fa59bf7c53cf',
        displayName: 'Yu, Brian',
        notes: 'Prefers Allston campus',
        instructorOrder: 1,
      },
    ],
    weekday: DAY.TUE,
    startHour: 11,
    startMinute: 30,
    endHour: 12,
    endMinute: 30,
    duration: 120,
  },
  {
    id: 'CHEM060THU01300330FALL2022',
    catalogNumber: 'CHEM 060',
    title: 'Foundations of Physical Chemistry',
    isUndergraduate: true,
    faculty: [
      {
        id: 'cb61d580-646a-487e-9151-6f0ee6fd692e',
        displayName: 'Tamer, Elie',
        notes: '',
        instructorOrder: 0,
      },
      {
        id: '9fd2b512-b832-427f-b91c-6472d01dec9d',
        displayName: 'Shapiro, Avi',
        notes: '',
        instructorOrder: 1,
      },
    ],
    weekday: DAY.THU,
    startHour: 1,
    startMinute: 30,
    endHour: 3,
    endMinute: 30,
    duration: 120,
  },
];
