import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
  ManyToOne,
  ObjectType,
  JoinColumn,
} from 'typeorm';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { TERM } from 'common/constants';
import { MeetingListingView } from 'server/meeting/MeetingListingView.entity';
import { NonClassEvent } from './nonclassevent.entity';
import { NonClassParentView } from './NonClassParentView.entity';

@ViewEntity('NonClassEventView', {
  expression: (connection: Connection):
  SelectQueryBuilder<NonClassEvent> => connection.createQueryBuilder()
    .select('event.id', 'id')
    .addSelect('event."nonClassParentId"', 'nonClassParentId')
    .addSelect('s."calendarYear"', 'calendarYear')
    .addSelect('s.term', 'term')
    .addSelect('event."semesterId"', 'semesterId')
    .leftJoin(SemesterView, 's', 's.id = event."semesterId"')
    .from(NonClassEvent, 'event'),
})
export class NonClassEventView {
  /**
   * From [[NonClassEvent]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[SemesterView]]
   * The calendar year in which the course instances takes place
   */
  @ViewColumn()
  public calendarYear: string;

  /**
   * From [[SemesterView]]
   * The term (Spring or Fall) in which the course instance takes place
   */
  public term: TERM;

  /**
   * An array of [[MeetingListView]]s representing the scheduled occurances
   * of this [[NonClassEventView]] in a given [[Semester]]
   */
  public meetings: MeetingListingView[];

  /**
   * From [[CourseInstance]]
   * The [[MultiYearPlanView]] this instance view belongs to
   */
  @JoinColumn()
  @ManyToOne(
    (): ObjectType<NonClassParentView> => NonClassParentView,
    ({ spring }): NonClassEventView => spring
  )
  @ManyToOne(
    (): ObjectType<NonClassParentView> => NonClassParentView,
    ({ fall }): NonClassEventView => fall
  )
  public nonClassParentId: string;
}
