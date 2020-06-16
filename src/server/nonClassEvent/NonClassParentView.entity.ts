import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  OneToMany,
  ObjectType,
} from 'typeorm';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';

@ViewEntity('NonClassParentView', {
  expression: (connection: Connection):
  SelectQueryBuilder<NonClassParent> => connection.createQueryBuilder()
    .select('parent.id', 'id')
    .addSelect('parent.contact', 'contact')
    .addSelect('parent.title', 'title')
    .addSelect('parent."courseId"', 'courseId')
    .from(NonClassParent, 'parent'),
})
export class NonClassParentView {
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public contact: string;

  @ViewColumn()
  public title: string;

  @ViewColumn()
  public courseId: string;

  public course: CourseListingView;

  public spring: NonClassEventView;

  public fall: NonClassEventView;

  @OneToMany(
    (): ObjectType<NonClassEventView> => NonClassEventView,
    ({ nonClassParentId }): string => nonClassParentId
  )
  public nonClassEvents: NonClassEventView[];
}
