import { TERM_PATTERN, DAY, FACULTY_TYPE } from 'common/constants';
import { TERM } from 'server/semester/semester.entity';

export * from './areas';
export * from './buildings';
export * from './campuses';
export * from './courses';
export * from './faculty';
export * from './rooms';
export * from './semesters';

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
export interface CourseData {
  title: string;
  area: string;
  prefix: string;
  number: string;
  isUndergraduate: boolean;
  notes: string;
  private: boolean;
  termPattern: TERM_PATTERN;
  isSEAS: boolean;
  sameAs: string | null;
  instances: {
    facultyHUIDs: string[];
    meetings: {
      day: DAY;
      startTime: string;
      endTime: string;
      room: string;
    }[];
  };
}

export interface FacultyData {
  firstName: string;
  lastName: string;
  email: string;
  HUID: string;
  jointWith: string | null;
  category: FACULTY_TYPE;
  area: string;
}

export interface RoomData {
  building: string;
  name: string;
}

export interface SemesterData {
  academicYear: number;
  term: TERM;
}

export type TestData = (
  AreaData
  | BuildingData
  | CampusData
  | CourseData
  | FacultyData
  | RoomData
  | SemesterData
);
