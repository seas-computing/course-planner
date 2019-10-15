import {
  Entity, Column, ManyToOne, ObjectType, OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Meeting } from './meeting.entity';
import { Building } from './building.entity';

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
    comment: 'The room name (i.e - Lecture Theatre)',
  })
  public name: string;

  /**
   * The number of people the room is able to accommodate
   *
   * @example `6`
   */
  @Column({
    type: 'int',
    comment: 'The number of people the room is able to accommodate',
  })
  public capacity: number;

  /**
   * All the past and future [[Meeting]]s that have occurred or are scheduled to
   * occur in this [[Room]]
   *
   * ---
   * One [[Room]] has many [[Meeting]]s
   */
  @OneToMany(
    (): ObjectType<Meeting> => Meeting,
    ({ room }): Room => room
  )
  public meetings: Meeting[];

  /**
   * The [[Building]] this room is located in
   *
   * ---
   * Many [[Room]]s have one [[Building]]
   */
  @ManyToOne(
    (): ObjectType<Building> => Building,
    ({ rooms }): Room[] => rooms
  )
  public building: Building;
}
