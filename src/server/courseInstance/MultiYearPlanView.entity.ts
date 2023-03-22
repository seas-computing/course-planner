import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
} from 'typeorm';
import { Course } from 'server/course/course.entity';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { IS_SEAS } from 'common/constants';

/**
 * A subset of fields from the [[Course]]
 */
@ViewEntity('MultiYearPlanView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select('c.id', 'id')
    .addSelect('c.prefix', 'catalogPrefix')
    .addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
    .addSelect('c.title', 'title')
    .addSelect('c."sameAsId"', 'sameAsId')
    .where(`c."isSEAS" <> '${IS_SEAS.N}'`)
    .from(Course, 'c'),
})
export class MultiYearPlanView {
  /**
   * From [[Course]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Course]]
   * Course prefix , e.g. `CS`
   */
  @ViewColumn()
  public catalogPrefix: string;

  /**
   * From [[Course]]
   * Merge of catalog prefix and catalog number, e.g. `CS 50`
   */
  @ViewColumn()
  public catalogNumber: string;

  /**
   * From [[Course]]
   * The long title for the course
   *
   * @example `"Introduction to Computer Science"`
   */
  @ViewColumn()
  public title: string;

  /**
   * From [[Course]]
   * A free text field for admin staff to record any other courses that this
   * course is the same as
   */
  @ViewColumn()
  public sameAsId: string;

  public semesters: SemesterView[];
}
