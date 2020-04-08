import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
} from 'typeorm';
import {
  Semester,
  TERM,
} from 'server/semester/semester.entity';
import { Course } from 'server/course/course.entity';
import { FacultyListingView } from 'server/faculty/FacultyListingView.entity';
import { Area } from 'server/area/area.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';

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
    .leftJoin(Area, 'a', 'c."areaId" = a.id')
    .from(Course, 'c')
    .leftJoinAndMapMany(
      'c.instances',
      'MultiYearPlanInstanceView',
      'instance',
      'instance."courseInstanceId" = instance.id'
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
  public instances: MultiYearPlanInstanceView[];
}

@ViewEntity('MultiYearPlanInstanceView', {
  expression: (connection: Connection):
  SelectQueryBuilder<CourseInstance> => connection.createQueryBuilder()
    .select('ci.id', 'id')
    .addSelect('s."academicYear"', 'calendarYear')
    .addSelect('s.term', 'term')
    .leftJoin(Semester, 's', 's.id = ci."semesterId"')
    .from(CourseInstance, 'ci'),
})
export class MultiYearPlanInstanceView {
  /**
   * From [[CourseInstance]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Semester]]
   * The calendar year in which the course instances takes place
   */
  @ViewColumn()
  public calendarYear: number;

  /**
   * From [[Semester]]
   * The term (Spring or Fall) in which the course instance takes place
   */
  public term: TERM;

  /**
   * One [[MultiYearPlanInstanceView]] has many [[FacultyListingView]]
   */
  public instructors: FacultyListingView[];
}
