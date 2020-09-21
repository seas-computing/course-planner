import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
} from 'typeorm';
import { Course } from 'server/course/course.entity';
import { SemesterView } from 'server/semester/SemesterView.entity';

/**
 * A subset of fields from the [[Course]]
 */

@ViewEntity('MultiYearPlanView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select('c.id', 'id')
    .addSelect('c.prefix', 'catalogPrefix')
    .addSelect('c.number', 'catalogNumber')
    .addSelect('c.title', 'title')
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
   * Course catalog number, e.g. `50`
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

  public semesters: SemesterView[];
}
