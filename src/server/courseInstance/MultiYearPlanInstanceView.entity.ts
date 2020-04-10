import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
} from 'typeorm';
import {
  Semester,
  TERM,
} from 'server/semester/semester.entity';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import { CourseInstance } from './courseinstance.entity';

@ViewEntity('MultiYearPlanInstanceView', {
  expression: (connection: Connection):
  SelectQueryBuilder<CourseInstance> => connection.createQueryBuilder()
    .select('ci.id', 'id')
    .addSelect('ci."courseId"', 'courseId')
    .addSelect('s.term', 'term')
    .addSelect(`CASE
        WHEN term == '${TERM.FALL}' THEN CAST((CAST(s.academicYear AS INTEGER) - 1) AS VARCHAR
        ELSE s.academicYear
      END`, 'calendarYear')
    .leftJoin(Semester, 's', 's.id = ci."semesterId"')
    // left join to FacultyInstance
    // then left join to Faculty
    .leftJoinAndMapMany(
      'ci.faculty',
      'FacultyListingView',
      'instructors',
      'instructors."courseInstanceId" = ci.id'
    )
    .from(CourseInstance, 'ci'),
})
/**
 * Represents a course instance within [[MultiYearPlanView]]
 */
export class MultiYearPlanInstanceView {
  /**
   * From [[CourseInstance]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[CourseInstance]]
   * The id of the parent course
   */
  @ViewColumn()
  public courseId: string;

  /**
   * From [[Semester]]
   * The academic year in which the course instances takes place
   */
  @ViewColumn()
  public academicYear: number;

  /**
   * From [[Semester]]
   * The calendar year in which the course instances takes place
   */
  @ViewColumn()
  public calendarYear: number;

  /**
   * From [[Semester]]
   * The term (Spring or Fall) in which the course instance takes place
   */
  @ViewColumn()
  public term: TERM;

  /**
   * One [[MultiYearPlanInstanceView]] has many [[FacultyListingView]]
   */
  public faculty: FacultyListingView[];
}
