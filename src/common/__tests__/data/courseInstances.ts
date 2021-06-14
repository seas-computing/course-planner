import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import {
  TERM_PATTERN,
  OFFERED,
  DAY,
  TERM,
  IS_SEAS,
} from 'common/constants';
import { MultiYearPlanResponseDTO } from 'common/dto/multiYearPlan/MultiYearPlanResponseDTO';

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
        notes: 'Prefers Sanders Theater',
      },
      {
        id: '4d952d8a-21a1-425b-876e-321ce708dea8',
        displayName: 'Waldo, James',
        notes: '',
      },
      {
        id: 'cec66944-8c43-4094-a05e-5fdccca2e04c',
        displayName: 'Amin, Nada',
        notes: null,
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
          campus: 'Cambridge',
          name: 'Sanders Theater',
        },
      },
      {
        id: 'f21f783c-2204-4f32-8459-4b84095bbcc0',
        day: DAY.TUE,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        room: {
          id: 'afc4ee36-b0cf-4cd7-97b7-b51b3323280d',
          campus: 'Cambridge',
          name: 'Sanders Theater',
        },
      },
      {
        id: 'be6235a9-3425-4b03-aa90-9a69997ad1cf',
        day: DAY.THU,
        startTime: '11:00 AM',
        endTime: '11:30 PM',
        room: null,
      },
    ],
  },
};

/**
 * The data object representing the Ordinary and Partial Differential Equations
 * course, AM 105, in the 2018 academic year. This course is only offered in
 * the spring, with one instructor and one meeting.
 * It has no notes or sameAs data.
 */
export const am105CourseInstance: CourseInstanceResponseDTO = {
  id: '6cdaede1-f5b4-47c1-8f96-a52524e49f86',
  title: 'Ordinary and Partial Differential Equations',
  area: 'AM',
  isUndergraduate: true,
  catalogNumber: 'AM 105',
  sameAs: '',
  isSEAS: IS_SEAS.Y,
  notes: null,
  termPattern: TERM_PATTERN.SPRING,
  fall: {
    id: '117b1fec-f46c-49f3-9e20-349f2472571a',
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
  spring: {
    id: '336248cd-003d-4e61-8c9e-ad71ff8c0858',
    calendarYear: '2017',
    offered: OFFERED.Y,
    preEnrollment: null,
    studyCardEnrollment: 140,
    actualEnrollment: 123,
    instructors: [
      {
        id: 'e2fed2a7-9f13-46e2-a46c-901f6f902f57',
        displayName: 'Levine, Margo',
      },
    ],
    meetings: [
      {
        id: '86bff820-6378-4d37-b017-6862f099c5c8',
        day: DAY.THU,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        room: {
          id: 'a176d455-a04b-4da8-a6b9-a3cf9ff5f6d4',
          campus: 'Cambridge',
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
        notes: '',
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
          campus: 'Cambridge',
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
        notes: '',
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
          campus: 'Cambridge',
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
        notes: 'Prefers Cambridge campus',
      },
      {
        id: '78f75a40-b0bd-43af-84d8-0ec68f313dba',
        displayName: 'Protopapas, Pavlos',
        notes: 'No preference on campus',
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
          campus: 'Cambridge',
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
          campus: 'Cambridge',
          name: 'Northwest Building B101',
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

export const ac209aCourseInstanceWithoutRooms
: CourseInstanceResponseDTO = {
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
        notes: 'Prefers Cambridge campus',
      },
      {
        id: '78f75a40-b0bd-43af-84d8-0ec68f313dba',
        displayName: 'Protopapas, Pavlos',
        notes: 'No preference on campus',
      },
    ],
    meetings: [
      {
        id: '0a3b2708-6191-4e1a-857b-6d3352836955',
        day: DAY.MON,
        startTime: '01:30 PM',
        endTime: '02:45 PM',
        room: null,
      },
      {
        id: '533bc88d-3652-43c9-9936-56e280b57d6e',
        day: DAY.WED,
        startTime: '01:30 PM',
        endTime: '02:45 PM',
        room: null,
      },
    ],
  },
};
/**
 * The starting academic year for the multi year plan test data
 */
export const testMultiYearPlanStartYear = 2020;

/**
 * The academic years corresponding to `testFourYearPlan`
 */
export const testFourYearPlanAcademicYears = [2020, 2021, 2022, 2023];

/**
 * Data representing a four year plan, which contains semesters from
 * Spring 2019 to Fall 2022. This four year plan contains data for AP 275,
 * ES 115, and CS 223.
 */
export const testFourYearPlan: MultiYearPlanResponseDTO[] = [{
  id: '37b66373-5000-43f2-9c14-8c2426273785',
  catalogPrefix: 'AP',
  catalogNumber: 'AP 275',
  title: 'Computational Design of Materials',
  semesters: [
    {
      id: 'ecf56c0b-0ba9-4532-b1ba-177071aac2e1',
      academicYear: '2020',
      calendarYear: '2019',
      term: TERM.FALL,
      instance: {
        id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
        faculty: [
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '49372311-991d-45a7-a1bf-2ba967d62663',
      academicYear: '2020',
      calendarYear: '2020',
      term: TERM.SPRING,
      instance: {
        id: '85d2ecdf-6015-4510-98ed-3b55991d2aea',
        faculty: [
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 0,
          },
          {
            id: 'f696d531-aef2-413f-9922-f480aa9d6039',
            displayName: 'Rycroft, Christopher',
            instructorOrder: 1,
          },
          {
            id: '05d04a88-8db2-46fe-8b87-aa70244ad655',
            displayName: 'Yacoby, Amir',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '7dd78af1-8821-4aba-b617-279922b7ffab',
      academicYear: '2021',
      calendarYear: '2020',
      term: TERM.FALL,
      instance: {
        id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
        faculty: [
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
      academicYear: '2021',
      calendarYear: '2021',
      term: TERM.SPRING,
      instance: {
        id: '127b33e4-e59a-43cb-a832-d5fc62a702ec',
        faculty: [
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 0,
          },
          {
            id: 'f696d531-aef2-413f-9922-f480aa9d6039',
            displayName: 'Rycroft, Christopher',
            instructorOrder: 1,
          },
          {
            id: '05d04a88-8db2-46fe-8b87-aa70244ad655',
            displayName: 'Yacoby, Amir',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '73d1ee13-8b05-46d9-86fc-9e86442f94bd',
      academicYear: '2022',
      calendarYear: '2021',
      term: TERM.FALL,
      instance: {
        id: 'bbc7492a-71b2-489b-a9ec-a0a052c4f5c8',
        faculty: [
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 0,
          },
          {
            id: '513e9576-cdc5-4911-8d1c-3f95c1bdc6cd',
            displayName: 'Golub, Benjamin',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '0dfa51cc-673b-4238-abc7-0908e9e57468',
      academicYear: '2022',
      calendarYear: '2022',
      term: TERM.SPRING,
      instance: {
        id: 'a9db3a67-f688-4474-a9ef-ae05d1327f4f',
        faculty: [
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 0,
          },
          {
            id: 'f696d531-aef2-413f-9922-f480aa9d6039',
            displayName: 'Rycroft, Christopher',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '83f73535-dbae-48b1-a73e-e3792358ab8d',
      academicYear: '2023',
      calendarYear: '2022',
      term: TERM.FALL,
      instance: {
        id: '61c48ebb-8025-43be-9d01-df057df74674',
        faculty: [],
      },
    },
    {
      id: '1e6e51ba-adc9-4526-a0b1-0dcb71e3d38e',
      academicYear: '2023',
      calendarYear: '2023',
      term: TERM.SPRING,
      instance: {
        id: '1f8cc026-d8bf-429d-9fdb-32b89cfdce9d',
        faculty: [],
      },
    },
  ],
},
{
  id: '9a07e8a3-d6d5-4e89-9d32-8ad04785b9ab',
  catalogPrefix: 'ES',
  catalogNumber: 'ES 115',
  title: 'Mathematical Modeling',
  semesters: [
    {
      id: 'ecf56c0b-0ba9-4532-b1ba-177071aac2e1',
      academicYear: '2020',
      calendarYear: '2019',
      term: TERM.FALL,
      instance: {
        id: '7dd78af1-8821-4aba-b617-279922b7ffab',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '49372311-991d-45a7-a1bf-2ba967d62663',
      academicYear: '2020',
      calendarYear: '2020',
      term: TERM.SPRING,
      instance: {
        id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
        faculty: [
          {
            id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
            displayName: 'Chen, Yiling',
            instructorOrder: 0,
          },
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '7dd78af1-8821-4aba-b617-279922b7ffab',
      academicYear: '2021',
      calendarYear: '2020',
      term: TERM.FALL,
      instance: {
        id: 'e3c785a1-d917-44a2-8349-829d05103de6',
        faculty: [
          {
            id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
            displayName: 'Chen, Yiling',
            instructorOrder: 0,
          },
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 1,
          },
          {
            id: '91c44209-68ff-4f3e-91b8-288709a49f26',
            displayName: 'Shapiro, Avi',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
      academicYear: '2021',
      calendarYear: '2021',
      term: TERM.SPRING,
      instance: {
        id: 'bbc7492a-71b2-489b-a9ec-a0a052c4f5c8',
        faculty: [
          {
            id: '91c44209-68ff-4f3e-91b8-288709a49f26',
            displayName: 'Shapiro, Avi',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '73d1ee13-8b05-46d9-86fc-9e86442f94bd',
      academicYear: '2022',
      calendarYear: '2021',
      term: TERM.FALL,
      instance: {
        id: 'cb489cc5-a7bd-4e29-b465-71d88ca73b71',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
          {
            id: '91c44209-68ff-4f3e-91b8-288709a49f26',
            displayName: 'Shapiro, Avi',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '0dfa51cc-673b-4238-abc7-0908e9e57468',
      academicYear: '2022',
      calendarYear: '2022',
      term: TERM.SPRING,
      instance: {
        id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
          {
            id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
            displayName: 'Chen, Yiling',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '83f73535-dbae-48b1-a73e-e3792358ab8d',
      academicYear: '2023',
      calendarYear: '2022',
      term: TERM.FALL,
      instance: {
        id: '127b33e4-e59a-43cb-a832-d5fc62a702ec',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '1e6e51ba-adc9-4526-a0b1-0dcb71e3d38e',
      academicYear: '2023',
      calendarYear: '2023',
      term: TERM.SPRING,
      instance: {
        id: 'c1b15206-8df8-483b-91e3-58a3911d15e7',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
          {
            id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
            displayName: 'Chen, Yiling',
            instructorOrder: 1,
          },
          {
            id: '91c44209-68ff-4f3e-91b8-288709a49f26',
            displayName: 'Shapiro, Avi',
            instructorOrder: 2,
          },
        ],
      },
    },
  ],
},
{
  id: 'b7dfe6fa-668a-4b89-912a-520c8aac8e6a',
  catalogPrefix: 'CS',
  catalogNumber: 'CS 223',
  title: 'Probabilistic Analysis and Algorithms',
  semesters: [
    {
      id: 'ecf56c0b-0ba9-4532-b1ba-177071aac2e1',
      academicYear: '2020',
      calendarYear: '2019',
      term: TERM.FALL,
      instance: {
        id: '2ca4b43f-1c73-4e17-a7d4-bd6f347d30d6',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '49372311-991d-45a7-a1bf-2ba967d62663',
      academicYear: '2020',
      calendarYear: '2020',
      term: TERM.SPRING,
      instance: {
        id: '508cacd5-6e75-4c3c-83a3-d274c00770e4',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '7dd78af1-8821-4aba-b617-279922b7ffab',
      academicYear: '2021',
      calendarYear: '2020',
      term: TERM.FALL,
      instance: {
        id: 'abefdab5-49e7-4865-a22c-7a6b04a7ac42',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
      academicYear: '2021',
      calendarYear: '2021',
      term: TERM.SPRING,
      instance: {
        id: 'b3eadbe3-816f-4219-836a-9fca021dcc86',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '73d1ee13-8b05-46d9-86fc-9e86442f94bd',
      academicYear: '2022',
      calendarYear: '2021',
      term: TERM.FALL,
      instance: {
        id: '155938bd-a4fb-47c1-9dfb-2c33480535ef',
        faculty: [
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '0dfa51cc-673b-4238-abc7-0908e9e57468',
      academicYear: '2022',
      calendarYear: '2022',
      term: TERM.SPRING,
      instance: {
        id: 'a2bdd06f-44b7-49c5-a4c6-ae3a01c07e7d',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '83f73535-dbae-48b1-a73e-e3792358ab8d',
      academicYear: '2023',
      calendarYear: '2022',
      term: TERM.FALL,
      instance: {
        id: 'f397e975-75db-4cf0-a4d7-7f929e376e83',
        faculty: [
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '1e6e51ba-adc9-4526-a0b1-0dcb71e3d38e',
      academicYear: '2023',
      calendarYear: '2023',
      term: TERM.SPRING,
      instance: {
        id: 'be77d84c-dc60-44c0-8d74-77187d63ce20',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
        ],
      },
    },
  ],
}];

/**
 * The academic years corresponding to `testThreeYearPlan`
 */
export const testThreeYearPlanAcademicYears = [2020, 2021, 2022];

/**
 * Data representing a three year plan, which contains semesters from
 * Fall 2020 to Spring 2022. This three year plan contains data for AP 275,
 * ES 115, and CS 223.
 */
export const testThreeYearPlan: MultiYearPlanResponseDTO[] = [{
  id: '37b66373-5000-43f2-9c14-8c2426273785',
  catalogPrefix: 'AP',
  catalogNumber: 'AP 275',
  title: 'Computational Design of Materials',
  semesters: [
    {
      id: 'ecf56c0b-0ba9-4532-b1ba-177071aac2e1',
      academicYear: '2020',
      calendarYear: '2019',
      term: TERM.FALL,
      instance: {
        id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
        faculty: [
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '49372311-991d-45a7-a1bf-2ba967d62663',
      academicYear: '2020',
      calendarYear: '2020',
      term: TERM.SPRING,
      instance: {
        id: '85d2ecdf-6015-4510-98ed-3b55991d2aea',
        faculty: [
          {
            id: 'f696d531-aef2-413f-9922-f480aa9d6039',
            displayName: 'Rycroft, Christopher',
            instructorOrder: 0,
          },
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 1,
          },
          {
            id: '05d04a88-8db2-46fe-8b87-aa70244ad655',
            displayName: 'Yacoby, Amir',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '7dd78af1-8821-4aba-b617-279922b7ffab',
      academicYear: '2021',
      calendarYear: '2020',
      term: TERM.FALL,
      instance: {
        id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
        faculty: [
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
      academicYear: '2021',
      calendarYear: '2021',
      term: TERM.SPRING,
      instance: {
        id: '127b33e4-e59a-43cb-a832-d5fc62a702ec',
        faculty: [
          {
            id: 'f696d531-aef2-413f-9922-f480aa9d6039',
            displayName: 'Rycroft, Christopher',
            instructorOrder: 0,
          },
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 1,
          },
          {
            id: '05d04a88-8db2-46fe-8b87-aa70244ad655',
            displayName: 'Yacoby, Amir',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '73d1ee13-8b05-46d9-86fc-9e86442f94bd',
      academicYear: '2022',
      calendarYear: '2021',
      term: TERM.FALL,
      instance: {
        id: 'bbc7492a-71b2-489b-a9ec-a0a052c4f5c8',
        faculty: [
          {
            id: '513e9576-cdc5-4911-8d1c-3f95c1bdc6cd',
            displayName: 'Golub, Benjamin',
            instructorOrder: 0,
          },
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '0dfa51cc-673b-4238-abc7-0908e9e57468',
      academicYear: '2022',
      calendarYear: '2022',
      term: TERM.SPRING,
      instance: {
        id: 'a9db3a67-f688-4474-a9ef-ae05d1327f4f',
        faculty: [
          {
            id: 'f696d531-aef2-413f-9922-f480aa9d6039',
            displayName: 'Rycroft, Christopher',
            instructorOrder: 0,
          },
          {
            id: '4dcef6f9-4e3e-49c0-a369-c30ab9615b96',
            displayName: 'Masahiro, Morii',
            instructorOrder: 1,
          },
        ],
      },
    },
  ],
},
{
  id: '9a07e8a3-d6d5-4e89-9d32-8ad04785b9ab',
  catalogPrefix: 'ES',
  catalogNumber: 'ES 115',
  title: 'Mathematical Modeling',
  semesters: [
    {
      id: 'ecf56c0b-0ba9-4532-b1ba-177071aac2e1',
      academicYear: '2020',
      calendarYear: '2019',
      term: TERM.FALL,
      instance: {
        id: '7dd78af1-8821-4aba-b617-279922b7ffab',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '49372311-991d-45a7-a1bf-2ba967d62663',
      academicYear: '2020',
      calendarYear: '2020',
      term: TERM.SPRING,
      instance: {
        id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
          {
            id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
            displayName: 'Chen, Yiling',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '7dd78af1-8821-4aba-b617-279922b7ffab',
      academicYear: '2021',
      calendarYear: '2020',
      term: TERM.FALL,
      instance: {
        id: 'e3c785a1-d917-44a2-8349-829d05103de6',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
          {
            id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
            displayName: 'Chen, Yiling',
            instructorOrder: 1,
          },
          {
            id: '91c44209-68ff-4f3e-91b8-288709a49f26',
            displayName: 'Shapiro, Avi',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
      academicYear: '2021',
      calendarYear: '2021',
      term: TERM.SPRING,
      instance: {
        id: 'bbc7492a-71b2-489b-a9ec-a0a052c4f5c8',
        faculty: [
          {
            id: '91c44209-68ff-4f3e-91b8-288709a49f26',
            displayName: 'Shapiro, Avi',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '73d1ee13-8b05-46d9-86fc-9e86442f94bd',
      academicYear: '2022',
      calendarYear: '2021',
      term: TERM.FALL,
      instance: {
        id: 'cb489cc5-a7bd-4e29-b465-71d88ca73b71',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
          {
            id: '91c44209-68ff-4f3e-91b8-288709a49f26',
            displayName: 'Shapiro, Avi',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '0dfa51cc-673b-4238-abc7-0908e9e57468',
      academicYear: '2022',
      calendarYear: '2022',
      term: TERM.SPRING,
      instance: {
        id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
        faculty: [
          {
            id: 'be64ce4b-081d-4987-8414-681bc5ca3193',
            displayName: 'Klecker, Nancy',
            instructorOrder: 0,
          },
          {
            id: '441c517f-bc48-46e3-86c2-4949d1908c5d',
            displayName: 'Chen, Yiling',
            instructorOrder: 1,
          },
        ],
      },
    },
  ],
},
{
  id: 'b7dfe6fa-668a-4b89-912a-520c8aac8e6a',
  catalogPrefix: 'CS',
  catalogNumber: 'CS 223',
  title: 'Probabilistic Analysis and Algorithms',
  semesters: [
    {
      id: 'ecf56c0b-0ba9-4532-b1ba-177071aac2e1',
      academicYear: '2020',
      calendarYear: '2019',
      term: TERM.FALL,
      instance: {
        id: '2ca4b43f-1c73-4e17-a7d4-bd6f347d30d6',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '49372311-991d-45a7-a1bf-2ba967d62663',
      academicYear: '2020',
      calendarYear: '2020',
      term: TERM.SPRING,
      instance: {
        id: '508cacd5-6e75-4c3c-83a3-d274c00770e4',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '7dd78af1-8821-4aba-b617-279922b7ffab',
      academicYear: '2021',
      calendarYear: '2020',
      term: TERM.FALL,
      instance: {
        id: 'abefdab5-49e7-4865-a22c-7a6b04a7ac42',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 2,
          },
        ],
      },
    },
    {
      id: '5f700cd5-9ff9-48a7-875d-2a7b7dc290ea',
      academicYear: '2021',
      calendarYear: '2021',
      term: TERM.SPRING,
      instance: {
        id: 'b3eadbe3-816f-4219-836a-9fca021dcc86',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 1,
          },
        ],
      },
    },
    {
      id: '73d1ee13-8b05-46d9-86fc-9e86442f94bd',
      academicYear: '2022',
      calendarYear: '2021',
      term: TERM.FALL,
      instance: {
        id: '155938bd-a4fb-47c1-9dfb-2c33480535ef',
        faculty: [
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 0,
          },
        ],
      },
    },
    {
      id: '0dfa51cc-673b-4238-abc7-0908e9e57468',
      academicYear: '2022',
      calendarYear: '2022',
      term: TERM.SPRING,
      instance: {
        id: 'a2bdd06f-44b7-49c5-a4c6-ae3a01c07e7d',
        faculty: [
          {
            id: 'd1130416-cf7f-41eb-8a16-e93d97205142',
            displayName: 'Brooks, David',
            instructorOrder: 0,
          },
          {
            id: '50b38487-e035-4e40-a48d-9b603ac7dfe1',
            displayName: 'Goldsmith, Mara',
            instructorOrder: 1,
          },
          {
            id: '54284de9-2b2c-4aac-915f-f960f319d3db',
            displayName: 'Dawson, Emily',
            instructorOrder: 2,
          },
        ],
      },
    },
  ],
}];
