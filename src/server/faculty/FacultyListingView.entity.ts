import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
} from 'typeorm';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';

/**
 * Lists faculty by "lastName, firstName", and also disaggregates the
 * [[FacultyCourseInstance]] associations to combine the instructor order and
 * courseInstanceId.
 */

@ViewEntity('FacultyListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Faculty> => connection.createQueryBuilder()
    .select('f.id', 'id')
    .addSelect('CONCAT_WS(\', \', f."lastName", f."firstName")', 'displayName')
    .addSelect('fci.order', 'instructorOrder')
    .addSelect('fci."courseInstanceId"', 'courseInstanceId')
    .leftJoin(FacultyCourseInstance, 'fci', 'fci."facultyId" = f.id')
    .from(Faculty, 'f'),
})
export class FacultyListingView {
  /**
   * From [[Faculty]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Faculty]]
   * A concatenation of the form lastName, firstName
   */
  @ViewColumn()
  public displayName: string;

  /**
   * From [[FacultyCourseInstance]]
   * We keep a reference to the instructorOrder in the database, but don't
   * actually make it part of the view. Since we're associating the
   * [[FacultyListingView]] directly with the [[CourseInstanceView]], we don't
   * need to maintain the separate join column
   */
  @ViewColumn()
  public instructorOrder: number;

  /**
   * Many [[FacultyListingViews]] have one [[CourseInstanceView]]s
   */
  public courseInstanceId: string;
}
