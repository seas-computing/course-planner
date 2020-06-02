import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  TERM_PATTERN, OFFERED, DAY, IS_SEAS,
} from 'common/constants';

/**
 * The data object representing the intro to computer science course CS 50 in
 * the 2018 academic year. This course is only offered in the fall, with one
 * instructor and one meeting. It has no notes or sameAs data.
 */

export const cs50CourseInstance: CourseInstanceResponseDTO = {
  id: 'ae6c6e2a-ffc4-4ac9-ae6d-d47b545be93e',
  title: 'Introduction to Computer Science',
  area: 'CS',
  isUndergraduate: true,
  catalogNumber: 'CS 050',
  sameAs: '',
  isSEAS: IS_SEAS.Y,
  notes: null,
  termPattern: TERM_PATTERN.FALL,
  spring: {
    id: '6cdaf745-4ab3-486b-b3fc-60ceba4ef621',
    calendarYear: '2018',
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
    calendarYear: '2017',
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
        room: {
          id: 'afc4ee36-b0cf-4cd7-97b7-b51b3323280d',
          name: 'Sanders Theater',
        },
      },
    ],
  },
};

/**
 * Data representing ES 95, which is offered in both fall and spring, with one
 * meeting and one instructor in each. It has no notes or sameAs data.
 */

export const es095CourseInstance: CourseInstanceResponseDTO = {
  id: '89c23511-3fcb-4436-aa2d-106f7c2aace0',
  title: 'Startup R & D',
  area: 'General',
  isUndergraduate: true,
  catalogNumber: 'ES 095r',
  sameAs: '',
  isSEAS: IS_SEAS.Y,
  notes: null,
  termPattern: TERM_PATTERN.BOTH,
  spring: {
    id: 'a311b26f-e033-4b41-8a74-5dcb7e390199',
    calendarYear: '2018',
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
        room: {
          id: 'bb64bef2-584c-4a40-8d3f-34137580472f',
          name: 'Maxwell Dworkin G110',
        },
      },
    ],
  },
  fall: {
    id: '213734a5-21d3-4476-9818-680761c19fee',
    calendarYear: '2017',
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
        room: {
          id: 'bb64bef2-584c-4a40-8d3f-34137580472f',
          name: 'Maxwell Dworkin G110',
        },
      },
    ],
  },
};

/**
 * Data representing the graduate intro to data science course, AC 209A, in the
 * 2019 academic year. This course is offered in the fall, has multiple
 * meetings and multiple instructors, and has notes and sameAs data.
 */

export const ac209aCourseInstance: CourseInstanceResponseDTO = {
  id: '42a3fb1b-55ff-4d50-9a3f-d637f759119a',
  title: 'Data Science 1: Introduction to Data Science',
  area: 'ACS',
  isUndergraduate: false,
  catalogNumber: 'AC 209a',
  sameAs: 'CS 109a, STATS 121a',
  isSEAS: IS_SEAS.Y,
  notes: 'Same as CS 109a, STATS 121a',
  termPattern: TERM_PATTERN.FALL,
  spring: {
    id: '62b375fa-f922-406f-bc08-7725edab27ac',
    calendarYear: '2019',
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
    id: 'b0aca4ce-e90b-47e4-97be-2187b3b7a621',
    calendarYear: '2018',
    offered: OFFERED.Y,
    preEnrollment: null,
    studyCardEnrollment: 77,
    actualEnrollment: 66,
    instructors: [
      {
        id: 'dcf88d99-1b7f-4863-93d3-d0b0bb43c8e7',
        displayName: 'Rader, Kevin',
      },
      {
        id: '78f75a40-b0bd-43af-84d8-0ec68f313dba',
        displayName: 'Protopapas, Pavlos',
      },
    ],
    meetings: [
      {
        id: '0a3b2708-6191-4e1a-857b-6d3352836955',
        day: DAY.MON,
        startTime: '01:30 PM',
        endTime: '02:45 PM',
        room: {
          id: '533bc88d-3652-43c9-9936-56e280b57d6f',
          name: 'Northwest Building B101',
        },
      },
      {
        id: '533bc88d-3652-43c9-9936-56e280b57d6e',
        day: DAY.WED,
        startTime: '01:30 PM',
        endTime: '02:45 PM',
        room: {
          id: '533bc88d-3652-43c9-9936-56e280b57d6f',
          name: 'Northwest Building B101',
        },
      },
    ],
  },
};
