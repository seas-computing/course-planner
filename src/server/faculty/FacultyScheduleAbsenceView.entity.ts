import {
  ViewEntity,
  SelectQueryBuilder,
  ViewColumn,
  Connection,
} from 'typeorm';
import { Absence, ABSENCE_TYPE } from 'server/absence/absence.entity';

@ViewEntity('FacultyScheduleAbsenceView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Absence> => connection.createQueryBuilder()
    .select('absence.id', 'id')
    .addSelect('absence."type"', 'type')
    .addSelect('absence."semesterId"', 'semesterId')
    .addSelect('absence."facultyId"', 'facultyId')
    .from(Absence, 'absence'),
})
/**
 * Represents an absence within [[FacultyScheduleSemesterView]]
 */
export class FacultyScheduleAbsenceView {
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

  /**
   * From [[Absence]]
   */
  @ViewColumn()
  public semesterId: string;

  /**
   * From [[Absence]]
   */
  @ViewColumn()
  public facultyId: string;
}
