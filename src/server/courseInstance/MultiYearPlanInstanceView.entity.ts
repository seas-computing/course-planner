import {
  ViewEntity,
  Connection,
  ViewColumn,
  SelectQueryBuilder,
  ManyToOne,
  ObjectType,
  JoinColumn,
} from 'typeorm';
import { MultiYearPlanFacultyListingView } from 'server/courseInstance/MultiYearPlanFacultyListingView.entity';
import { TERM } from 'common/constants';
import { CourseInstance } from './courseinstance.entity';
import { MultiYearPlanView } from './MultiYearPlanView.entity';

@ViewEntity('MultiYearPlanInstanceView', {
  expression: (connection: Connection):
  SelectQueryBuilder<CourseInstance> => connection.createQueryBuilder()
    .select('ci.id', 'id')
    .addSelect('ci."courseId"', 'courseId')
    .addSelect('ci."semesterId"', 'semesterId')
    .from(CourseInstance, 'ci'),
})
/**
 * Represents a course instance within [[MultiYearPlanView]]
 */
export class MultiYearPlanInstanceView {
  /**
   * From [[CourseInstance]]
   */
  @ViewColumn()
  public id: string;

  /**
   * From [[CourseInstance]]
   */
  @ViewColumn()
  public courseId: string;

  /**
   * From [[Faculty]]
   * The faculty for the course instance
   */
  public faculty: MultiYearPlanFacultyListingView[];
}
