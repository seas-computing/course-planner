export interface SemesterFilterState {
  absence: string;
}

export interface FacultyFilterState {
  area: string;
  lastName: string;
  firstName: string;
  category: string;
  fall: SemesterFilterState;
  spring: SemesterFilterState;
}
