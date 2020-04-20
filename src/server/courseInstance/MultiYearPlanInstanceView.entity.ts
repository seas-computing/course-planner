import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  ManyToOne,
  ObjectType,
  OneToMany,
} from 'typeorm';
import {
  Semester,
  TERM,
} from 'server/semester/semester.entity';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
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
    .addSelect('instructors."instructorOrder"', 'instructorOrder')
    .addSelect('instructors."displayName"', 'displayName')
    .leftJoin(Semester, 's', 's.id = ci."semesterId"')
    // NOTE: The leftJoinAndMapMany does the left join,
    // but does not appear to do the mapping,
    // which is required for the instances property below.
    // The workaround for now is to duplicate this leftJoinAndMapMany in the
    // place where the repository is queried.
    .leftJoinAndMapMany(
      'faculty',
      FacultyListingView,
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
   * The [[MultiYearPlanView]] this instance view belongs to
   */
  @ManyToOne(
    (): ObjectType<MultiYearPlanView> => MultiYearPlanView,
    ({ instances }): MultiYearPlanInstanceView[] => instances,
    {
      nullable: false,
    }
  )
  public courseId: MultiYearPlanView;

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
   * One [[MultiYearPlanInstanceView]] has many [[FacultyListingView]]
   */
  @OneToMany(
    (): ObjectType<FacultyListingView> => FacultyListingView,
    ({ multiYearPlanInstanceView }): MultiYearPlanInstanceView => (
      multiYearPlanInstanceView
    )
  )
  public faculty: FacultyListingView[];
}
