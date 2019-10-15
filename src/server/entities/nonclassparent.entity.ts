import {
  Entity, Column, ObjectType, ManyToOne, OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';
import { NonClassEvent } from './nonclassevent.entity';

/**
 * Parent entity to non-class events. Designed to be analogous to {@link Course}
 * except that non-class events occur independently of courses and course
 * instances and therefore need to be able to be scheduled independently.
 */
@Entity()
export class NonClassParent extends BaseEntity {
  /**
   * The title of this collection of non-class events
   *
   * @example `"Computer Science Lab Session"`
   */
  @Column({
    type: 'varchar',
  })
  public title: string;

  /**
   * The facutly member contact for a given non-class event.
   * This is recorded here, as this informatino does not regularly change.
   */
  @Column({
    type: 'varchar',
    comment: 'The faculty member contact for a given event. This is recorded here, as this information does not regularly change',
  })
  public contact: string;

  /**
   * The [[Course]] associated with this collection of non class events.
   *
   * ---
   * Many [[NonClassParent]]s have one [[Course]]
   */
  @ManyToOne(
    (): ObjectType<Course> => Course,
    ({ nonClassParents }): NonClassParent[] => nonClassParents
  )
  public course: Course;

  /**
   * Collection of scheduled events. These are typically events that occur
   * outside the normal teaching of classes (for example, office hours or
   * seminars)
   *
   * ---
   * One [[NonClassParent]] has many [[NonClassEvent]]s
   */
  @OneToMany(
    (): ObjectType<NonClassEvent> => NonClassEvent,
    ({ nonClassParent }): NonClassParent => nonClassParent
  )
  public nonClassEvents: NonClassEvent[];
}
