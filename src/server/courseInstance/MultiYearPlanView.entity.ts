import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
} from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { SemesterView } from 'server/semester/SemesterView.entity';

/**
 * A subset of fields from the [[Course]]
 */

@ViewEntity('MultiYearPlanView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select('c.id', 'id')
    .addSelect('c.prefix', 'catalogprefix')
    .addSelect('c.number', 'catalogNumber')
    //.addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
    .addSelect('c.title', 'title')
    .from(Course, 'c')
    //.leftJoin(Area, 'a', 'c."areaId" = a.id'),
})
export class MultiYearPlanView {
  /**
   * From [[Course]]
   */
  @ViewColumn()
  public id: string;


  /**
   * From [[Course]]
   * Combines the course prefix and number, e.g. `CS 50`
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
