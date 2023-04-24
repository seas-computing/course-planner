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
    .addSelect('ci."courseId"', 'id')
    .addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
    .addSelect(`
      CASE
        -- 1. A course with children won't have a parent or siblings
        WHEN count("childCourses".id) > 0
          THEN STRING_AGG(CONCAT_WS(' ', "childCourses".prefix, "childCourses".number), ', ')
        -- 2. A course with siblings must have a parent AND cannot have children
        WHEN count("siblingCourses".id) > 0
          THEN CONCAT_WS(
            ', ',
            CONCAT_WS(' ', "parentCourse".prefix, "parentCourse".number),
            STRING_AGG(CONCAT_WS(' ', "siblingCourses".prefix, "siblingCourses".number), ', ')
          )
        -- 3. A course with a parent but no siblings cannot have children
        WHEN c."sameAsId" IS NOT NULL
          THEN CONCAT_WS(' ', "parentCourse".prefix, "parentCourse".number)
        -- 4. Default to empty string
        ELSE ''
      END`, 'sameAs')
    .from(FacultyCourseInstance, 'fci')
    .leftJoin(CourseInstance, 'ci', 'ci.id = fci."courseInstanceId"')
    .leftJoin(Course, 'c', 'ci."courseId" = c.id')
    .leftJoin(Course, 'parentCourse', '"parentCourse"."id" = c."sameAsId"')
    .leftJoin(Course, 'childCourses', '"childCourses"."sameAsId" = c.id')
    .leftJoin(Course, 'siblingCourses', '"siblingCourses"."sameAsId" = c."sameAsId" AND "siblingCourses".id <> c.id')
    .groupBy('fci."courseInstanceId"')
    .addGroupBy('fci."facultyId"')
    .addGroupBy('ci."semesterId"')
    .addGroupBy('ci."courseId"')
    .addGroupBy('c.prefix')
    .addGroupBy('c.number')
    .addGroupBy('c."sameAsId"')
    .addGroupBy('"parentCourse".prefix')
    .addGroupBy('"parentCourse".number'),
})
/**
 * Represents a course within [[FacultyScheduleSemesterView]]
 */
export class FacultyScheduleCourseView {
  /**
   * From [[CourseInstance]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[FacultyCourseInstance]]
   */
  public courseInstanceId: string;

  /**
   * From [[FacultyCourseInstance]]
   */
  public facultyId: string;

  /**
   * From [[CourseInstance]]
   */
  public semesterId: string;

  /**
   * From [[Course]]
   * Combines the course prefix and number, e.g. `AM 10`
   */
  @ViewColumn()
  public catalogNumber: string;

  /**
   * From [[Course]]
   * A free text field for admin staff to record any other courses that this
   * course is the same as
   */
  @ViewColumn()
  public sameAs: string;
}
