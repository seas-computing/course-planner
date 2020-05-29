import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  OneToMany,
  ObjectType,
} from 'typeorm';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';


@ViewEntity('NonClassParentView', {
  expression: (connection: Connection):
  SelectQueryBuilder<NonClassParent> => connection.createQueryBuilder()
    .from(NonClassParent, 'parent'),
})
export class NonClassParentView {
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public contact: string;

  @ViewColumn()
  public title: string;

  public courseId: string;

  public spring: NonClassEventView;

  public fall: NonClassEventView;

  @OneToMany(
    (): ObjectType<NonClassEventView> => NonClassEventView,
    ({ nonClassParentId }): string => nonClassParentId
  )
  public nonClassEvents: NonClassEventView[];
}