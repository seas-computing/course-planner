export interface SemesterFilterState {
  absence: {
    type: string;
  };
}

export interface FacultyFilterState {
  area: string;
  lastName: string;
  firstName: string;
  category: string;
  fall: SemesterFilterState;
  spring: SemesterFilterState;
}
