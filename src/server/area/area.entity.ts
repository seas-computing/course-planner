import { NonClassParent } from 'server/nonClassEvent/nonclassparent.entity';
import {
  Entity, Column, OneToMany, ObjectType,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Course } from '../course/course.entity';
import { Faculty } from '../faculty/faculty.entity';

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
    comment: 'The subject area name (i.e - Applied Mathematics)',
  })
  public name: string;

  /**
   * An array of [[Course]]s within this subject area
   *
   * ---
   * One [[Area]] has many [[Course]]s
   */
  @OneToMany(
    (): ObjectType<Course> => Course,
    ({ area }): Area => area
  )
  public courses: Course[];

  /**
   * An array of [[NonClassParent]]s within this subject area
   *
   * ---
   * One [[Area]] has many [[NonClassParent]]s
   */
  @OneToMany(
    (): ObjectType<NonClassParent> => NonClassParent,
    ({ area }): Area => area
  )
  public nonClassParents: NonClassParent[];

  /**
   * An array of [[Faculty]] members
   *
   * ---
   * One [[Area]] has many [[Faculty]] members
   */
  @OneToMany(
    (): ObjectType<Faculty> => Faculty,
    ({ area }): Area => area
  )
  public faculty: Faculty[];
}
