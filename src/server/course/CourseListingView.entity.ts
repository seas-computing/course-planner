import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
} from 'typeorm';
import { Course } from 'server/course/course.entity';
import { Area } from 'server/area/area.entity';
import { TERM_PATTERN } from 'common/constants';
import { CourseInstanceListingView } from 'server/courseInstance/courseInstanceListingView.entity';

@ViewEntity('CourseListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Course> => connection.createQueryBuilder()
    .select('c.id', 'id')
    .addSelect('a.name', 'area')
    .addSelect('c."isUndergraduate"', 'isUndergraduate')
    .addSelect("CONCAT_WS(' ', c.prefix, c.number)", 'catalogNumber')
    .addSelect('c."sameAs"', 'sameAs')
    .addSelect('c."isSEAS"', 'isSEAS')
    .addSelect('c.notes', 'notes')
    .addSelect('c."termPattern"', 'termPattern')
    .leftJoin(Area, 'a', 'c."areaId" = a.id')
    .from(Course, 'c'),
})
export class CourseListingView {
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public area: string;

  @ViewColumn()
  public isUndergraduate: boolean;

  @ViewColumn()
  public catalogNumber: string;

  @ViewColumn()
  public sameAs: string;

  @ViewColumn()
  public isSEAS: boolean;

  @ViewColumn()
  public notes: string;

  @ViewColumn()
  public termPattern: TERM_PATTERN;

  public spring: CourseInstanceListingView;

  public fall: CourseInstanceListingView;
}
