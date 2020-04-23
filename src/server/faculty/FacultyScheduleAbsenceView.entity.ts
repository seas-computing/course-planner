import {
  ViewEntity,
  SelectQueryBuilder,
  Connection,
  ViewColumn,
} from 'typeorm';
import { Absence, ABSENCE_TYPE } from 'server/absence/absence.entity';

@ViewEntity('FacultyScheduleCourseView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Absence> => connection.createQueryBuilder()
    .select('absence.id', 'id')
    .addSelect('absence.type', 'type')
    .from(Absence, 'absence'),
})
export class FacultyScheduleCourseView {
  /**
   * From [[Absence]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Absence]]
   * The type of faculty leave
   */
  @ViewColumn()
  public type: ABSENCE_TYPE;
}
