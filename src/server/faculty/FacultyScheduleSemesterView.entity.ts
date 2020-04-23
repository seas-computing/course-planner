import {
  ViewEntity,
  SelectQueryBuilder,
  ViewColumn,
  Connection,
} from 'typeorm';
import {
  Semester,
  TERM,
} from 'server/semester/semester.entity';
import { FacultyScheduleCourseView } from './FacultyScheduleCourseView.entity';
import { FacultyScheduleAbsenceView } from './FacultyScheduleAbsenceView.entity';

@ViewEntity('FacultyScheduleInstanceView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Semester> => connection.createQueryBuilder()
    // Note that academicYear in the semester table is actually calendar year
    .select(`CASE
      WHEN term = '${TERM.FALL}' THEN semester.academicYear + 1
      ELSE semester.academicYear
    END`, 'academicYear')
    .addSelect('semester.academicYear', 'calendarYear')
    .addSelect('semester.term', 'term')
    .from(Semester, 'semester'),
})
/**
 * Represents a semester instance within [[FacultyScheduleView]]
 */
export class FacultyScheduleInstanceView {
  /**
   * From [[Semester]]
   * The academic year in which the course instances takes place
   */
  @ViewColumn()
  public academicYear: string;

  /**
   * From [[Semester]]
   * The calendar year in which the course instances takes place
   */
  @ViewColumn()
  public calendarYear: string;

  /**
   * From [[Semester]]
   * The term (Spring or Fall) in which the course instance takes place
   */
  @ViewColumn()
  public term: TERM;

  public courses: FacultyScheduleCourseView[];

  public absence: FacultyScheduleAbsenceView;
}
