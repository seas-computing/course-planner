import {
  ViewEntity,
  ViewColumn,
  Connection,
  SelectQueryBuilder,
} from 'typeorm';
import { TERM } from 'common/constants';
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
}
