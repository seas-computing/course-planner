import {
  Entity,
  Column,
  ManyToOne,
  ObjectType,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { NonClassParent } from './nonclassparent.entity';
import { Semester } from './semester.entity';
import { Meeting } from './meeting.entity';

@Entity()
export class NonClassEvent extends BaseEntity {
  /**
   * The title of the non-class event. This type of event is usually used to
   * schedule non-class meetings such as reading groups, seminars etc.
   */
  @Column({
    type: 'varchar',
    comment: 'The title of the non-class event. This type of event is typically'
      + ' used to schedule non-class meetings such as reading groups etc.',
  })
  public title: string;

  /**
   * Parent entity to contain a group of related non-class events.
   * [[NonClassParent]] and [[NonClassEvent]] is analogous to [[Course]] and
   * [[CourseInstance]] (respectively)
   */
  @ManyToOne(
    (): ObjectType<NonClassParent> => NonClassParent,
    ({ nonClassEvents }): NonClassEvent[] => nonClassEvents
  )
  public nonClassParent: NonClassParent;

  /**
   * The [[Semester]] this event occurs in
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
   *  @see [[Course.private]]
   */
  @Column({
    type: 'boolean',
    default: true,
  })
  public private: boolean = true;

  @OneToMany(
    (): ObjectType<Meeting> => Meeting,
    ({ nonClassEvent }): NonClassEvent => nonClassEvent
  )
  public meetings: Meeting[];
}
