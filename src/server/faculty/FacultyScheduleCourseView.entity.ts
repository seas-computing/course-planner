import {
  ViewEntity,
  SelectQueryBuilder,
  Connection,
  ViewColumn,
} from 'typeorm';
import { Course } from 'server/course/course.entity';

@ViewEntity('FacultyScheduleCourseView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select('course.id', 'id')
    .addSelect("CONCAT_WS(' ', course.prefix, course.number)", 'catalogNumber')
    .from(Course, 'course'),
})
export class FacultyScheduleCourseView {
  /**
   * From [[Course]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Course]]
   * Combines the course prefix and number, e.g. `AM 10`
   */
  @ViewColumn()
  public catalogNumber: string;
}
