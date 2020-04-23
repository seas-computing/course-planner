import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
} from 'typeorm';
import { Area } from 'server/area/area.entity';
import { FACULTY_TYPE } from 'common/constants';
import { Faculty } from './faculty.entity';
import { FacultyScheduleInstanceView } from './FacultyScheduleSemesterView.entity';

/**
 * A subset of fields from [[Faculty]]
 */
@ViewEntity('FacultyScheduleView', {
  expression: (connection: Connection):
  SelectQueryBuilder<Faculty> => connection.createQueryBuilder()
    .select('faculty.id', 'id')
    .addSelect('area.name', 'area')
    .addSelect('faculty."lastName"', 'lastName')
    .addSelect('faculty."firstName"', 'firstName')
    .addSelect('faculty.category', 'category')
    .addSelect('faculty."jointWith"', 'jointWith')
    .from(Faculty, 'faculty')
    .leftJoin(Area, 'area', 'faculty.areaId = area.id'),
})

export class FacultyScheduleView {
  /**
   * From [[Faculty]]
   * The faculty id
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[Area]]
   * The faculty's associated area
   */
  @ViewColumn()
  public area: string;

  /**
   * From [[Faculty]]
   * The faculty's last name
   */
  @ViewColumn()
  public lastName: string;

  /**
   * From [[Faculty]]
   * The faculty's first name
   */
  @ViewColumn()
  public firstName: string;

  /**
   * From [[Faculty]]
   * The faculty's type that specifies their role
   */
  @ViewColumn()
  public category: FACULTY_TYPE;

  /**
   * From [[Faculty]]
   * The faculty's joint with property, if any
   */
  @ViewColumn()
  public jointWith: string;

  public fall: FacultyScheduleInstanceView;

  public spring: FacultyScheduleInstanceView;
}
