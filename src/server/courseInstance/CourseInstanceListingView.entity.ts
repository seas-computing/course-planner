import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
  ObjectType,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Semester } from 'server/semester/semester.entity';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import { MeetingListingView } from 'server/meeting/MeetingListingView.entity';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { OFFERED, TERM } from 'common/constants';
import { CourseInstance } from './courseinstance.entity';

/**
 * [[CourseInstanceListingView]]s are used to generate the table of courses on
 * the main page of the application. Each will be nested under a
 * [[CourseListingView]] in either the `spring` or `fall` column.
 */

@ViewEntity('CourseInstanceListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<CourseInstance> => connection.createQueryBuilder()
    .select('ci.id', 'id')
    .addSelect('ci."courseId"', 'courseId')
    .addSelect('ci.offered', 'offered')
    .addSelect('ci."preEnrollment"', 'preEnrollment')
    .addSelect('ci."studyCardEnrollment"', 'studyCardEnrollment')
    .addSelect('ci."actualEnrollment"', 'actualEnrollment')
    .addSelect('s."academicYear"', 'calendarYear')
    .addSelect('s.term', 'term')
    .leftJoin(Semester, 's', 's.id = ci."semesterId"')
    .from(CourseInstance, 'ci'),
})
export class CourseInstanceListingView {
  /**
   * From [[CourseInstance]]
   * */

  @ViewColumn()
  public id: string;

  /**
   * From [[Semester]]
   * Since each instance takes place in only one semester, we need to record
   * the calendar year in which it takes place, so it can be displayed as part
   * of the academic year.
   */
  @ViewColumn()
  public calendarYear: string;

  /**
   * From [[CourseInstance]]
   * Whether the course is offered that semester
   */
  @ViewColumn()
  public offered: OFFERED;

  /**
   * From [[CourseInstance]]
   * Students enrolled in this course before shopping week
   */
  @ViewColumn()
  public preEnrollment?: number | null;

  /**
   * From [[CourseInstance]]
   * Students enrolled in this class during shopping week
   */
  @ViewColumn()
  public studyCardEnrollment?: number | null;

  /**
   * From [[CourseInstance]]
   * Students enrolled in this course after shopping week is over
   */
  @ViewColumn()
  public actualEnrollment?: number | null;

  /**
   * From [[Semester]]
   * Whether this instance is in the spring or fall
   */
  public term: TERM;

  /**
   * One [[CourseInstanceListingView]] has many [[FacultyListingView]]
   */
  public instructors: FacultyListingView[];

  /**
   * One [[CourseInstanceListingView]] has many [[MeetingListingView]]
   */
  public meetings: MeetingListingView[];

  /**
   * From [[CourseInstance]]
   * Many [[CourseInstanceListingView]] can have one [[CourseListingView]]
   * This column is annotated twice since the parent [[CourseListingView]]
   * object will have separate spring and fall columns for the two
   * [[CourseInstanceListingView]]s in the given academic year.
   */

  @JoinColumn()
  @ManyToOne(
    (): ObjectType<CourseListingView> => CourseListingView,
    ({ spring }): CourseInstanceListingView => spring
  )
  @ManyToOne(
    (): ObjectType<CourseListingView> => CourseListingView,
    ({ fall }): CourseInstanceListingView => fall
  )
  public courseId: string;
}
