import {
  Entity,
  Column,
  ManyToOne,
  ObjectType,
} from 'typeorm';
import { DAY } from 'common/constants';
import { BaseEntity } from '../base/base.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { Room } from '../location/room.entity';

@Entity()
export class Meeting extends BaseEntity {
  /**
   * The time of day this event (meeting) begins in 24 hour time with ISO8601 timezone
   * @example `"19:15:40"`
   */
  @Column({
    type: 'time',
    comment: 'The time of day this event (meeting) begins in 24 hour time (e.g "19:15:40")',
  })
  public startTime: string;

  /**
   * The time of day this event (meeting) ends in 24 hour time with ISO8601 timezone
   * @example `"19:15:40"`
   */
  @Column({
    type: 'time',
    comment: 'The time of day this event (meeting) ends in 24 hour time (e.g "19:15:40")',
  })
  public endTime: string;

  @Column({
    type: 'enum',
    enum: Object.values(DAY),
    comment: 'The day of the week this meeting occurs (i.e: Mon). Each record indicates a seperate ocurrance of a class. This means that a courses with sessions on Monday, Wednesday and Thursday should have 3 rows in this table for each seperate session. This allows split scheduling so that a class can occur at different times on different days',
  })
  public day: DAY;

  /**
   * Many [[Meeting]]s have one [[NonClassEvent]]
   */
  @ManyToOne(
    (): ObjectType<NonClassEvent> => NonClassEvent,
    ({ meetings }): Meeting[] => meetings,
    { orphanedRowAction: 'delete' }

  )
  public nonClassEvent: NonClassEvent;

  /**
   * Many [[Meeting]]s have one [[CourseInstance]]
   */
  @ManyToOne(
    (): ObjectType<CourseInstance> => CourseInstance,
    ({ meetings }): Meeting[] => meetings,
    { orphanedRowAction: 'delete' }
  )
  public courseInstance: CourseInstance;

  /**
   * Many [[Meeting]]s have one [[Room]]
   */
  @ManyToOne(
    (): ObjectType<Room> => Room,
    ({ meetings }): Meeting[] => meetings
  )
  public room: Room;
}
