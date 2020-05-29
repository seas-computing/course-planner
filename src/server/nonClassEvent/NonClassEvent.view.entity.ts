import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
  ManyToOne,
  JoinColumn,
  ObjectType,
} from 'typeorm';
import { Semester } from 'server/semester/semester.entity';
import { TERM } from 'common/constants';
import { NonClassEvent } from './nonclassevent.entity';
import { NonClassParentView } from './NonClassParentView.entity';

@ViewEntity('NonClassEventView', {
  expression: (connection: Connection):
  SelectQueryBuilder<NonClassEvent> => connection.createQueryBuilder()
    .select('event.id', 'id')
    .addSelect('event."nonClassParentId"', 'nonClassParentId')
    .addSelect(`CASE
        WHEN term = '${TERM.FALL}' THEN s.academicYear + 1
        ELSE s.academicYear
      END`, 'academicYear')
    .addSelect('s.term', 'term')
    .addSelect('event."semesterId"', 'semesterId')
    .leftJoin(Semester, 's', 's.id = event."semesterId"')
    .from(NonClassEvent, 'event'),
})
export class NonClassEventView {
  /**
   * From [[NonClassEvent]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Semester]]
   * The academic year in which the course instances takes place
   */
  @ViewColumn()
  public academicYear: string;

  /**
   * From [[Semester]]
   * The term (Spring or Fall) in which the course instance takes place
   */
  @ViewColumn()
  public term: TERM;

  /**
   * From [[CourseInstance]]
   * The [[MultiYearPlanView]] this instance view belongs to
   */
  @ViewColumn()
  @JoinColumn()
  @ManyToOne(
    (): ObjectType<NonClassParentView> => NonClassParentView,
    ({ nonClassEvents }): NonClassEventView[] => nonClassEvents
  )
  public nonClassParentId: string;
}
