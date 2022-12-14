import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
} from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import { CourseInstanceListingView } from 'server/courseInstance/CourseInstanceListingView.entity';

/**
 * A subset of fields from the [[Course]]
 */

@ViewEntity('CourseListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select('c.id', 'id')
    .addSelect('a.name', 'area')
    .addSelect('c.title', 'title')
    .addSelect('c."isUndergraduate"', 'isUndergraduate')
    .addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
    .addSelect('ARRAY_AGG(CONCAT_WS(\' \', "childCourses".prefix, "childCourses".number))', 'childCourseNumbers')
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
    .addSelect('c."isSEAS"', 'isSEAS')
    .addSelect('c.notes', 'notes')
    .addSelect('c."termPattern"', 'termPattern')
    .addSelect('c."sameAsId"', 'sameAsId')
    .leftJoin(Area, 'a', 'c."areaId" = a.id')
    .leftJoin(Course, 'parentCourse', '"parentCourse"."id" = c."sameAsId"')
    .leftJoin(Course, 'childCourses', '"childCourses"."sameAsId" = c.id')
    .leftJoin(Course, 'siblingCourses', '"siblingCourses"."sameAsId" = c."sameAsId" AND "siblingCourses".id <> c.id')
    .from(Course, 'c')
    .groupBy('c.id')
    .addGroupBy('c.title')
    .addGroupBy('a.name')
    .addGroupBy('"parentCourse".prefix')
    .addGroupBy('"parentCourse".number'),
})
export class CourseListingView {
  /**
   * From [[Course]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Course]]
   * the title of the course
   */
  @ViewColumn()
  public title: string;

  /**
   * From [[Area]]
   * Only the name of the course's associated academic area
   */
  @ViewColumn()
  public area: string;

  /**
   * From [[Course]]
   * Indicates whether or not this course is an undergraduate course.
   */
  @ViewColumn()
  public isUndergraduate: boolean;

  /**
   * From [[Course]]
   * Combines the course prefix and number, e.g. `CS 50`
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

  /**
  /* From [[Course]]
   * Not all courses are delivered by SEAS, some are delivered by other
   * divisions (for example, some courses may be science courses), therefore
   * it may be desireable to denote such courses to differenciate them from
   * courses offered by SEAS
   */
  @ViewColumn()
  public isSEAS: IS_SEAS;

  /**
   * From [[Course]]
   * Free text for administrators to record notes against a course
   */
  @ViewColumn()
  public notes: string;

  /**
   * From [[Course]]
   * The term this course is being delivered in. See [[TERM_PATTERN]] for
   * allowed values.
   */
  @ViewColumn()
  public termPattern: TERM_PATTERN;

  /**
   * One [[CourseListingView]] can have one [[CourseInstance]] per semester,
   * with each [[CourseListingView]] representing a single academic year
   * spanning two calendar years
   */
  public spring: CourseInstanceListingView;

  public fall: CourseInstanceListingView;
}
