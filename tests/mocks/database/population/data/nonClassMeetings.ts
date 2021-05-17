import { DAY } from '../../../../../src/common/constants';

export const nonClassMeetings = [
  {
    title: 'Computer Science Area Meeting',
    contactName: 'James Waldo',
    contactEmail: 'j.waldo@harvard.edu',
    contactPhone: '(123)-456-7890',
    expectedSize: 16,
    notes: null,
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
    contactEmail: '',
    contactPhone: '(111)-222-3333',
    expectedSize: 26,
    notes: 'some notes',
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
    contactEmail: '',
    contactPhone: '',
    expectedSize: null,
    private: false,
    meetings: [],
  },
];
