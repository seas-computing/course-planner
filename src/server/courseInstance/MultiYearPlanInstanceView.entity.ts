import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  ManyToOne,
  ObjectType,
  JoinColumn,
} from 'typeorm';
import {
  Semester,
  TERM,
} from 'server/semester/semester.entity';
import { MultiYearPlanFacultyListingView } from 'server/courseInstance/MultiYearPlanFacultyListingView.entity';
import { CourseInstance } from './courseinstance.entity';
import { MultiYearPlanView } from './MultiYearPlanView.entity';

@ViewEntity('MultiYearPlanInstanceView', {
  expression: (connection: Connection):
  SelectQueryBuilder<CourseInstance> => connection.createQueryBuilder()
    .select('ci.id', 'id')
    .addSelect('ci."courseId"', 'courseId')
    // Note that academicYear in the semester table is actually calendar year
    .addSelect(`CASE
        WHEN term = '${TERM.FALL}' THEN s.academicYear + 1
        ELSE s.academicYear
      END`, 'academicYear')
    .addSelect('s.academicYear', 'calendarYear')
    .addSelect('s.term', 'term')
    .addSelect('ci."semesterId"', 'semesterId')
    .leftJoin(Semester, 's', 's.id = ci."semesterId"')
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
   * The [[MultiYearPlanView]] this instance view belongs to
   */
  @ViewColumn()
  @JoinColumn()
  @ManyToOne(
    (): ObjectType<MultiYearPlanView> => MultiYearPlanView,
    ({ instances }): MultiYearPlanInstanceView[] => instances
  )
  public courseId: string;

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

  /**
   * From [[Faculty]]
   * The faculty for the course instance
   */
  public faculty: MultiYearPlanFacultyListingView[];
}
