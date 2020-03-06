import { TERM } from 'server/semester/semester.entity';

export const semesters = [
  2018,
  2019,
  2020,
  2021,
  2022,
].reduce(
  (list: [], year: number): Semester[] => list.append(
    [TERM.FALL, TERM.SPRING].map((term) => ({
      academicYear: year,
      term,
    })), []
  )
);
