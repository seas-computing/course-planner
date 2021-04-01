import {
  Entity,
  Column,
  ManyToOne,
  ObjectType,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { NonClassParent } from '../nonClassParent/nonclassparent.entity';
import { Semester } from '../semester/semester.entity';
import { Meeting } from '../meeting/meeting.entity';

@Entity()
export class NonClassEvent extends BaseEntity {
  /**
   * Parent entity to contain a group of related non-class events.
   * [[NonClassParent]] and [[NonClassEvent]] is analogous to [[Course]] and
   * [[CourseInstance]] (respectively)
   *
   * ---
   * Many [[NonClassEvent]]s have one [[NonClassParent]]
   */
  @ManyToOne(
    (): ObjectType<NonClassParent> => NonClassParent,
    ({ nonClassEvents }): NonClassEvent[] => nonClassEvents
  )
  public nonClassParent: NonClassParent;

  /**
   * The [[Semester]] this event occurs in
   *
   * ---
   * Many [[NonClassEvent]]s have one [[Semester]]
   */
  @ManyToOne(
    (): ObjectType<Semester> => Semester,
    ({ nonClassEvents }): NonClassEvent[] => nonClassEvents
  )
  public semester: Semester;

  /**
   * Allows admin staff to hide courses and prevent their publication, either
   * because the courses are non-SEAS courses and should not be displayed on
   * the SEAS course schedule, or because they are still finalizing the course
   * details
   *
   * @see [[Course.private]]
   */
  @Column({
    type: 'boolean',
    default: true,
  })
  public private = true;

  /**
   * One [[NonClassEvent]] has many [[Meeting]]s
   */
  @OneToMany(
    (): ObjectType<Meeting> => Meeting,
    ({ nonClassEvent }): NonClassEvent => nonClassEvent,
    { cascade: ['insert'] }
  )
  public meetings: Meeting[];
}
