import {
  ViewEntity,
  ViewColumn,
  Connection,
  SelectQueryBuilder,
} from 'typeorm';
import { TERM } from 'common/constants';
import { MultiYearPlanInstanceView } from 'server/courseInstance/MultiYearPlanInstanceView.entity';
import { Semester } from './semester.entity';

/**
 * A subset of fields from [[Semester]]
 * along with the calculated academic year value
 */
@ViewEntity('SemesterView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Semester> => connection.createQueryBuilder()
    .select('s.id', 'id')
    // Note that academicYear in the semester table is actually calendar year
    .addSelect('s."academicYear"', 'calendarYear')
    .addSelect(`CASE
      WHEN term = '${TERM.FALL}' THEN s.academicYear + 1
      ELSE s.academicYear
    END`, 'academicYear')
    .addSelect('s.term', 'term')
    .addSelect(`CASE
    WHEN term = '${TERM.SPRING}' THEN 1
    WHEN term = '${TERM.FALL}' THEN 2
    ELSE 3
    END`, 'termOrder')
    .from(Semester, 's'),
})

/**
 * Represents a semester view that includes the calculated academic year value
 */
export class SemesterView {
  /**
   * From [[Semester]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Semester]]
   * The calendar year in which the event is taking place
   */
  @ViewColumn()
  public calendarYear: string;

  /**
   * From [[Semester]]
   * The academic year in which the event is taking place
   */
  @ViewColumn()
  public academicYear: string;

  /**
   * From [[Semester]]
   * The term in which the event is taking place
   */
  @ViewColumn()
  public term: string;

  /**
   * An assignment of a number to fall and spring semesters for the purpose of
   * arranging semesters in chronological order
   */
  @ViewColumn()
  public termOrder: number;

  /**
   * From [[CourseInstance]]
   * The course instance for the given semester
   */
  public instance: MultiYearPlanInstanceView;
}
