import { DAY } from '../../../../../src/common/constants';

export const nonClassMeetings = [
  {
    title: 'Computer Science Area Meeting',
    contact: 'James Waldo',
    private: false,
    meetings: [
      {
        day: DAY.TUE,
        startTime: '11:00:00',
        endTime: '12:00:00',
        room: 'Maxwell Dworkin B151',
      },
    ],
  },
  {
    title: 'Active Learning Labs Staff Meeting',
    contact: 'Nishant V. Sule',
    private: false,
    meetings: [
      {
        day: DAY.THU,
        startTime: '11:00:00',
        endTime: '12:00:00',
        room: '114 Western Avenue 200',
      },
    ],
  },
  {
    title: 'Quantum Lab Meeting',
    contact: 'Pri Narang',
    private: false,
    meetings: [],
  },
];
