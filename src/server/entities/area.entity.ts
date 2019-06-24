import {
  Entity, Column, OneToMany, ObjectType,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';

/**
 * A subject area is a categorization of coures that all fall within a similar
 * subject area.
 *
 * For example, _"AM 10"_, _"AM 021a"_ and _"AM 115"_ all occur within the
 * _"Appled Mathematics"_ area.
 */
@Entity()
export class Area extends BaseEntity {
  /**
   * The subject area name
   *
   * @example "Applied Mathematics"
   */
  @Column({
    type: 'varchar',
    nullable: false,
    comment: 'The subject area name (i.e - Applied Mathematics)',
  })
  public name: string;

  /**
   * An array of [[Course]]s within this subject area
   */
  @OneToMany(
    (): ObjectType<Course> => Course,
    ({ area }): Area => area
  )
  public courses: Course[];
}
