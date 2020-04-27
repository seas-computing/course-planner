import {
  ViewEntity,
  SelectQueryBuilder,
  Connection,
  ViewColumn,
} from 'typeorm';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { Course } from 'server/course/course.entity';

@ViewEntity('FacultyScheduleCourseView', {
  expression: (connection: Connection):
  SelectQueryBuilder<FacultyCourseInstance> => connection.createQueryBuilder()
    .select('fci."courseInstanceId"', 'courseInstanceId')
    .addSelect('fci."facultyId"', 'facultyId')
    .addSelect('ci."semesterId"', 'semesterId')
    .addSelect('ci."courseId"', 'courseId')
    .addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
    .from(FacultyCourseInstance, 'fci')
    .leftJoin(CourseInstance, 'ci', 'ci.id = fci."courseInstanceId"')
    .leftJoin(Course, 'c', 'ci."courseId" = c.id'),
})
/**
 * Represents a course within [[FacultyScheduleSemesterView]]
 */
export class FacultyScheduleCourseView {
  /**
   * From [[FacultyCourseInstance]]
   */
  @ViewColumn()
  public courseInstanceId: string;

  /**
   * From [[FacultyCourseInstance]]
   */
  @ViewColumn()
  public facultyId: string;

  /**
   * From [[CourseInstance]]
   */
  @ViewColumn()
  public semesterId: string;

  /**
   * From [[CourseInstance]]
   */
  @ViewColumn()
  public courseId: string;

  /**
   * From [[Course]]
   * Combines the course prefix and number, e.g. `AM 10`
   */
  @ViewColumn()
  public catalogNumber: string;
}
