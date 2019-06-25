import {
  Entity,
  Column,
  ManyToOne,
  ObjectType,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { NonClassEvent } from './nonclassevent.entity';
import { CourseInstance } from './courseinstance.entity';

/**
 * Set list of days on which a [[Meeting]] can be scheduled to occur
 */
export enum DAY {
  /** Monday */
  MON = 'Mon',
  /** Tuesday */
  TUE = 'Tue',
  /** Wednesday */
  WED = 'Wed',
  /** Thursday */
  THU = 'Thu',
  /** Friday */
  FRI = 'Fri'
}

@Entity()
export class Meeting extends BaseEntity {
  @Column({
    type: 'time with time zone',
    nullable: false,
    comment: 'The time of day this event (meeting) begins',
  })
  public start: string;

  @Column({
    type: 'time with time zone',
    nullable: false,
    comment: 'The time of day this event (meeting) ends',
  })
  public end: string;

  @Column({
    type: 'enum',
    enum: Object.values(DAY),
    comment: 'The day of the week this meeting occurs (i.e: Mon). Each record'
      + ' indicates a seperate ocurrance of a class. This means that a courses'
      + ' with sessions on Monday, Wednesday and Thursday should have 3 rows'
      + ' in this table for each seperate session. This allows split'
      + ' scheduling so that a class can occur at different times on different'
      + ' days',
  })
  public day: DAY;

  @ManyToOne(
    (): ObjectType<NonClassEvent> => NonClassEvent,
    ({ meetings }): Meeting[] => meetings
  )
  public nonClassEvent: NonClassEvent;

  @ManyToOne(
    (): ObjectType<CourseInstance> => CourseInstance,
    ({ meeting }): Meeting => meeting
  )
  public courseInstance: CourseInstance;
}
