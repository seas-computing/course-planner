import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
  ManyToOne,
  ObjectType,
  JoinColumn,
} from 'typeorm';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { CourseInstanceListingView } from 'server/courseInstance/courseInstanceListingView.entity';

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
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public displayName: string;

  public instructorOrder: number;

  /**
   * Many [[FacultyListingViews]] have one [[CourseInstanceView]]s
   */
  @ManyToOne(
    (): ObjectType<CourseInstanceListingView> => CourseInstanceListingView,
    ({ instructors }): FacultyListingView[] => instructors
  )
  @JoinColumn()
  public courseInstanceId: CourseInstanceListingView;
}
