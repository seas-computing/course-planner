import {
  Entity, Column, ObjectType, OneToMany,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';

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
   * The faculty member name for a given event.
   * This is recorded here as it does not regularly change between events.
   */
  @Column({
    type: 'varchar',
    comment: 'The faculty member name for a given event. This is recorded here as it does not regularly change between events.',
    nullable: true,
  })
  public contactName?: string;

  /**
   * The contact email for a given non class parent.
   * This is recorded here as it does not regularly change between events.
   */
  @Column({
    type: 'varchar',
    comment: 'The contact email for a given non class parent. This is recorded here as it does not regularly change between events.',
    nullable: true,
  })
  public contactEmail?: string;

  /**
   * The contact phone number for a given non class parent.
   * This is recorded here as it does not regularly change between events.
   */
  @Column({
    type: 'varchar',
    comment: 'The contact phone number for a given non class parent. This is recorded here as it does not regularly change between events.',
    nullable: true,
  })
  public contactPhone?: string;

  /**
   * Any notes users may wish to record against this NonClassParent can be
   * recorded here
   */
  @Column({
    type: 'text',
    comment: 'Any notes users may wish to record against this NonClassParent can be recorded here',
    nullable: true,
  })
  public notes?: string;

  /**
   * Expected enrollment size for this academic year
   */
  @Column({
    type: 'int',
    comment: 'Expected enrollment size for this academic year',
    nullable: true,
  })
  public expectedSize?: number;

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
    ({ nonClassParent }): NonClassParent => nonClassParent,
    { cascade: ['insert'] }
  )
  public nonClassEvents: NonClassEvent[];
}
