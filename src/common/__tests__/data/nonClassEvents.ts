import { DAY } from 'common/constants';
import CreateNonClassParentDTO from 'common/dto/nonClassMeetings/CreateNonClassParent.dto';
import NonClassMeetingResponseDTO from 'common/dto/nonClassMeetings/NonClassMeeting.dto';
import UpdateNonClassParentDTO from 'common/dto/nonClassMeetings/UpdateNonClassParent.dto';
import { NonClassParent } from 'server/nonClassEvent/nonclassparent.entity';

/**
 * Data Science Reading Group
 *
 * Non-class parent for data science reading group formatted to match
 * [[NonClassMeetingResponseDTO]].
 */
export const dataScienceReadingGroup: NonClassMeetingResponseDTO = {
  area: 'FAS',
  id: '9548f85e-d613-48d2-94fe-63dbaf95084c',
  contactName: 'Jim Waldo',
  contactEmail: null,
  contactPhone: '(617) 555-0123',
  notes: null,
  expectedSize: 190,
  title: 'Data Science Reading Group',
  spring: {
    id: '59d737ac-aadc-4e67-8d7a-7db2299d0026',
    calendarYear: '2020',
    meetings: [
      {
        id: '06369a12-24f0-4a5c-8ecc-9e0124179f75',
        day: DAY.FRI,
        startTime: '12:14:00',
        endTime: '12:17:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
      {
        id: '968bd796-0cfb-402a-91e3-59b44c2c9ab9',
        day: DAY.MON,
        startTime: '12:08:00',
        endTime: '12:10:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
    ],
  },
  fall: {
    id: '613778f2-ef61-475e-8ca3-71a6416de9a4',
    calendarYear: '2020',
    meetings: [
      {
        id: 'bd572431-e00e-4a78-9975-1aa90d86c15b',
        day: DAY.FRI,
        startTime: '12:14:00',
        endTime: '12:17:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
      {
        id: 'afa76436-4523-4f3b-a952-95ec76c1294d',
        day: DAY.MON,
        startTime: '12:08:00',
        endTime: '12:10:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
    ],
  },
};

/**
 * Data Science Reading Group
 *
 * Non-class parent for data science reading group formatted to match
 * [[NonClassMeetingResponseDTO]].
 */
export const computationalModelingofFluidsReadingGroup:
NonClassMeetingResponseDTO = {
  area: 'ACS',
  id: 'ad9a6a86-4cd1-4063-bd6d-c7379f10c540',
  contactName: 'Jim Waldo',
  contactEmail: 'jwaldo@harvard.edu',
  contactPhone: null,
  notes: 'Some notes',
  expectedSize: null,
  title: 'Computational Modeling of Fluids and Soft Matter Reading Group',
  spring: {
    id: '3086f1be-a15f-491f-b82b-e991f3e747b1',
    calendarYear: '2020',
    meetings: [
      {
        id: '69c72509-3cf0-431a-a1d1-924dcdd43b01',
        day: DAY.FRI,
        startTime: '12:14:00',
        endTime: '12:17:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
      {
        id: 'afef329c-90af-4d67-9f86-74568a466d26',
        day: DAY.MON,
        startTime: '12:08:00',
        endTime: '12:10:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
    ],
  },
  fall: {
    id: 'dfd31de2-d794-457a-bf46-908618afb7ca',
    calendarYear: '2020',
    meetings: [
      {
        id: '8bf44cd9-6aaa-4e39-a295-65794daf45cf',
        day: DAY.FRI,
        startTime: '12:14:00',
        endTime: '12:17:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
      {
        id: 'ac220eec-6775-4974-9950-700a2459979e',
        day: DAY.MON,
        startTime: '12:08:00',
        endTime: '12:10:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
    ],
  },
};

/**
 * Applied Math Reading Group
 *
 * Non-class parent for applied math reading group formatted to match
 * [[NonClassMeetingResponseDTO]].
 */
export const appliedMathematicsReadingGroup: NonClassMeetingResponseDTO = {
  area: 'AM',
  id: '6512a306-3d2f-4a03-97fe-2dc7aac37107',
  contactName: 'Cliff Taube',
  contactEmail: 'ctaube@fas.harvard.edu',
  contactPhone: null,
  notes: 'This reading group is usually well attended',
  expectedSize: null,
  title: 'Applied mathematics reading group',
  spring: {
    id: '1cdcc7f4-2f0b-42f5-bd41-51dba7deda16',
    calendarYear: '2020',
    meetings: [
      {
        id: 'b5916e2b-42d6-46f3-acb7-dea1e3541a00',
        day: DAY.FRI,
        startTime: '12:14:00',
        endTime: '12:17:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
      {
        id: 'dbe4a352-6755-4ffb-b0ca-e58e13fa8320',
        day: DAY.TUE,
        startTime: '16:00:00',
        endTime: '17:00:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
    ],
  },
  fall: {
    id: '44f22dbb-d6c7-4673-8a7d-f70aa0562350',
    calendarYear: '2020',
    meetings: [
      {
        id: '732c4b36-9239-4aa6-b131-c8d5cd15908d',
        day: DAY.WED,
        startTime: '08:00:00',
        endTime: '10:00:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
      {
        id: '59be22e9-29b4-4b98-87f5-e157cbbc76ee',
        day: DAY.TUE,
        startTime: '10:00:00',
        endTime: '11:10:00',
        room: {
          id: '17d19e35-617d-486d-9b40-f30197342c18',
          name: 'Maxwell Dworkin G115 Lecture Theatre',
          campus: 'Cambridge',
        },
      },
    ],
  },
};

/**
 * Create Non-class Parent
 *
 * Version of [[dataScienceReadingGroup]] but changed to match
 * [[CreateNonClassParentDTO]].
 */
export const createNonClassParent: CreateNonClassParentDTO = {
  area: 'e257e0bb-9875-4688-a7f8-91906c45fce2',
  contactName: 'Jim Waldo',
  contactEmail: null,
  contactPhone: '(617) 555-0123',
  notes: null,
  expectedSize: 190,
  title: 'Data Science Reading Group',
};

/**
 * Update Non-class Parent
 *
 * Version of [[dataScienceReadingGroup]] but changed to match
 * [[UpdateNonClassParentDTO]]. Since all fields on this DTO are optional, some
 * fields have been deliberately omitted from this data structure to demonstrate
 * that fact.
 *
 * The fields that remain were chosen to try and give a wide variety of types.
 * Of the remaining fields, there are:
 * - A UUID
 * - A string
 * - A  null field
 * - A numeric field
 * - A phone number
 */
export const updateNonClassParent: UpdateNonClassParentDTO = {
  area: 'e257e0bb-9875-4688-a7f8-91906c45fce2',
  contactName: 'Jim Waldo',
  contactPhone: '(617) 555-0123',
  notes: null,
  expectedSize: 190,
};

/**
 * A version of [[dataScienceReadingGroup]] but re-shaped to
 * match [[NonClassParent]].
 */
export const nonClassParent: Partial<NonClassParent> = {
  id: '49ac4edb-26ce-46d1-9e17-cc552939a3be',
  title: 'Data Science Reading Group',
  notes: null,
  expectedSize: 190,
  contactName: 'Jim Waldo',
  contactEmail: null,
  contactPhone: '(617) 555-0123',
};
