import {
  Entity, Column, ManyToOne, ObjectType,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Meeting } from './meeting.entity';

/**
 * A [[Room]] within a [[Building]]
 */
@Entity()
export class Room extends BaseEntity {
  /**
   * The room name
   *
   * @example `"Lecture theatre"`
   */
  @Column({
    type: 'varchar',
    nullable: false,
    comment: 'The room name (i.e - Lecture Theatre)',
  })
  public name: string;

  /**
   * The floor the room is located on
   *
   * @example `"Ground"`
   */
  @Column({
    type: 'varchar',
    nullable: false,
    comment: 'The floor the room is located on (i.e - "Ground")',
  })
  public floor: string;

  /**
   * The number of people the room is able to accommodate
   *
   * @example `6`
   */
  @Column({
    type: 'int',
    nullable: false,
    comment: 'The number of people the room is able to accommodate',
  })
  public capacity: number;

  /**
   * All the past and future [[Meeting]]s that have occurred or are scheduled to
   * occur in this [[Room]]
   */
  @ManyToOne(
    (): ObjectType<Meeting> => Meeting,
    ({ room }): Room => room
  )
  public meetings: Meeting[];
}
