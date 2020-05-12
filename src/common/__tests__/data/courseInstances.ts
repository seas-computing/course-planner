import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { TERM_PATTERN, OFFERED, DAY } from 'common/constants';

export const cs50CourseInstance: CourseInstanceResponseDTO = {
  id: 'ae6c6e2a-ffc4-4ac9-ae6d-d47b545be93e',
  title: 'Introduction to Computer Science',
  area: 'CS',
  isUndergraduate: true,
  catalogNumber: 'CS 050',
  sameAs: '',
  isSEAS: true,
  notes: null,
  termPattern: TERM_PATTERN.FALL,
  spring: {
    id: '6cdaf745-4ab3-486b-b3fc-60ceba4ef621',
    calendarYear: 2018,
    offered: OFFERED.BLANK,
    preEnrollment: null,
    studyCardEnrollment: null,
    actualEnrollment: null,
    instructors: [],
    meetings: [
      {
        id: null,
        day: null,
        startTime: null,
        endTime: null,
        room: null,
      },
    ],
  },
  fall: {
    id: '1ee96ccd-a36a-4602-8793-88e1b862add4',
    calendarYear: 2017,
    offered: OFFERED.Y,
    preEnrollment: null,
    studyCardEnrollment: 697,
    actualEnrollment: 694,
    instructors: [
      {
        id: '8d2c8320-dfe5-4d6b-9722-525f94401c7d',
        displayName: 'Malan, David',
      },
    ],
    meetings: [
      {
        id: 'afc4ee36-b0cf-4cd7-97b7-b51b3323280a',
        day: DAY.FRI,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        room: null,
      },
    ],
  },
};


export const es095CourseInstance: CourseInstanceResponseDTO = {
  id: '89c23511-3fcb-4436-aa2d-106f7c2aace0',
  title: 'Startup R & D',
  area: 'General',
  isUndergraduate: true,
  catalogNumber: 'ES 095r',
  sameAs: '',
  isSEAS: true,
  notes: null,
  termPattern: TERM_PATTERN.BOTH,
  spring: {
    id: 'a311b26f-e033-4b41-8a74-5dcb7e390199',
    calendarYear: 2018,
    offered: OFFERED.Y,
    preEnrollment: null,
    studyCardEnrollment: 25,
    actualEnrollment: 33,
    instructors: [
      {
        id: 'ae3948c7-b254-4cfb-aa9f-5c54c13a1a86',
        displayName: 'Bottino, Paul',
      },
    ],
    meetings: [
      {
        id: 'bb64bef2-584c-4a40-8d3f-34137580472e',
        day: DAY.TUE,
        startTime: '03:00 PM',
        endTime: '05:45 PM',
        room: null,
      },
    ],
  },
  fall: {
    id: '213734a5-21d3-4476-9818-680761c19fee',
    calendarYear: 2017,
    offered: OFFERED.Y,
    preEnrollment: null,
    studyCardEnrollment: 39,
    actualEnrollment: 45,
    instructors: [
      {
        id: 'ae3948c7-b254-4cfb-aa9f-5c54c13a1a86',
        displayName: 'Bottino, Paul',
      },
    ],
    meetings: [
      {
        id: 'a405c124-391d-4584-b7f2-6c4442dcd4a4',
        day: DAY.THU,
        startTime: '04:00 PM',
        endTime: '06:00 PM',
        room: null,
      },
    ],
  },
};
