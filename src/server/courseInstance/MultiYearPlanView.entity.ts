import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  OneToMany,
  ObjectType,
} from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { MultiYearPlanInstanceView } from './MultiYearPlanInstanceView.entity';

/**
 * A subset of fields from the [[Course]]
 */

@ViewEntity('MultiYearPlanView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select('c.id', 'id')
    .addSelect('a.name', 'area')
    .addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
    .addSelect('c.title', 'title')
    .from(Course, 'c')
    .leftJoin(Area, 'a', 'c."areaId" = a.id')
    // NOTE: The leftJoinAndMapMany does the left join,
    // but does not appear to do the mapping,
    // which is required for the instances property below.
    // The workaround for now is to duplicate this leftJoinAndMapMany in the
    // place where the repository is queried.
    .leftJoinAndMapMany(
      'instances',
      MultiYearPlanInstanceView,
      'instances',
      'c.id = instances."courseId"'
    ),
})
export class MultiYearPlanView {
  /**
   * From [[Course]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Area]]
   * Only the name of the course's associated academic area
   */
  @ViewColumn()
  public area: string;

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

  /**
   * One [[MultiYearPlanView]] has many [[MultiYearPlanInstanceView]]
   */
  @OneToMany(
    (): ObjectType<MultiYearPlanInstanceView> => MultiYearPlanInstanceView,
    ({ courseId }): MultiYearPlanView => courseId
  )
  public instances: MultiYearPlanInstanceView[];
}
