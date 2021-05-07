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
    .select('parent.id', 'id')
    .addSelect('parent.contactName', 'contactName')
    .addSelect('parent.contactEmail', 'contactEmail')
    .addSelect('parent.contactPhone', 'contactPhone')
    .addSelect('parent.title', 'title')
    .from(NonClassParent, 'parent'),
})
export class NonClassParentView {
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public contact_name: string;

  @ViewColumn()
  public contact_email: string;

  @ViewColumn()
  public contact_phone: string;

  @ViewColumn()
  public title: string;

  public spring: NonClassEventView;

  public fall: NonClassEventView;

  @OneToMany(
    (): ObjectType<NonClassEventView> => NonClassEventView,
    ({ nonClassParentId }): string => nonClassParentId
  )
  public nonClassEvents: NonClassEventView[];
}
