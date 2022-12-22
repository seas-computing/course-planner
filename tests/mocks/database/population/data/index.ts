import {
  TERM_PATTERN,
  DAY,
  FACULTY_TYPE,
  TERM,
  IS_SEAS,
  ABSENCE_TYPE,
} from 'common/constants';

export * from './absences';
export * from './areas';
export * from './buildings';
export * from './campuses';
export * from './courses';
export * from './faculty';
export * from './rooms';
export * from './semesters';
export * from './nonClassMeetings';

export interface AbsenceData {
  type: ABSENCE_TYPE;
  faculty: string;
}

export interface AreaData {
  name: string;
}
export interface BuildingData {
  campus: string;
  name: string;
}
export interface CampusData {
  name: string;
}

export interface MeetingData {
  day: DAY;
  startTime: string;
  endTime: string;
  room: string;
}

export interface CourseData {
  title: string;
  area: string;
  prefix: string;
  number: string;
  isUndergraduate: boolean;
  notes: string;
  private: boolean;
  termPattern: TERM_PATTERN;
  isSEAS: IS_SEAS;
  sameAs?: string;
  instances: {
    facultyHUIDs: string[];
    meetings: MeetingData[];
  };
}

export interface FacultyData {
  firstName: string;
  lastName: string;
  email: string;
  HUID: string;
  jointWith: string | null;
  notes: string | null;
  category: FACULTY_TYPE;
  area: string;
}

export interface RoomData {
  building: string;
  name: string;
  capacity: number;
}

export interface SemesterData {
  academicYear: number;
  term: TERM;
}

export interface NonClassMeetingData {
  title: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  expectedSize?: number;
  notes?: string;
  private: boolean;
  meetings: MeetingData[];
}

export type TestData = (
  AbsenceData
  | AreaData
  | BuildingData
  | CampusData
  | CourseData
  | FacultyData
  | RoomData
  | SemesterData
  | NonClassMeetingData
);
