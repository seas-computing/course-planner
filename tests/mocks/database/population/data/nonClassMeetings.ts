import { DAY } from '../../../../../src/common/constants';

export const nonClassMeetings = [
  {
    title: 'Computer Science Area Meeting',
    contactName: 'James Waldo',
    private: false,
    meetings: [
      {
        day: DAY.TUE,
        startTime: '11:00:00-05',
        endTime: '12:00:00-05',
        room: 'Maxwell Dworkin B151',
      },
    ],
  },
  {
    title: 'Active Learning Labs Staff Meeting',
    contactName: 'Nishant V. Sule',
    private: false,
    meetings: [
      {
        day: DAY.THU,
        startTime: '11:00:00-05',
        endTime: '12:00:00-05',
        room: '114 Western Avenue 200',
      },
    ],
  },
  {
    title: 'Quantum Lab Meeting',
    contactName: 'Pri Narang',
    private: false,
    meetings: [],
  },
];
