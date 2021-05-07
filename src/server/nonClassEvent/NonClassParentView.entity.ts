import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  OneToMany,
  ObjectType,
} from 'typeorm';
import { Area } from 'server/area/area.entity';
import { NonClassParent } from 'server/nonClassParent/nonclassparent.entity';
import { NonClassEventView } from './NonClassEvent.view.entity';

@ViewEntity('NonClassParentView', {
  expression: (connection: Connection):
  SelectQueryBuilder<NonClassParent> => connection.createQueryBuilder()
    .select('parent.id', 'id')
    .addSelect('parent.contactName', 'contactName')
    .addSelect('parent.contactEmail', 'contactEmail')
    .addSelect('parent.contactPhone', 'contactPhone')
    .addSelect('parent.notes', 'notes')
    .addSelect('parent.expectedSize', 'expectedSize')
    .addSelect('parent.title', 'title')
    .addSelect('area.name', 'area')
    .leftJoin(Area, 'area', 'area.id = parent."areaId"')
    .from(NonClassParent, 'parent'),
})
export class NonClassParentView {
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public contactName: string;

  @ViewColumn()
  public contactEmail: string;

  @ViewColumn()
  public contactPhone: string;

  @ViewColumn()
  public notes: string;

  @ViewColumn()
  public title: string;

  @ViewColumn()
  public expectedSize: number;

  @ViewColumn()
  public area: string;

  public spring: NonClassEventView;

  public fall: NonClassEventView;

  @OneToMany(
    (): ObjectType<NonClassEventView> => NonClassEventView,
    ({ nonClassParentId }): string => nonClassParentId
  )
  public nonClassEvents: NonClassEventView[];
}
