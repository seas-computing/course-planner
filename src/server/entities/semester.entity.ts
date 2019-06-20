import {
  Entity,
  Column,
  ObjectType,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { CourseInstance } from './courseinstance.entity';

export enum TERM {
  FALL = 'Fall',
  SPRING = 'Spring',
}

@Entity()
export abstract class Semester extends BaseEntity {
  /**
   * The academic year (as a 4 digit integer)
   */
  @Column({
    type: 'int',
  })
  public acyr: number;

  /**
   * The term this semester occurs in. Can be either spring or fall.
   */
  @Column({
    type: 'enum',
    enum: Object.values(TERM),
  })
  public term: TERM;

  /**
   * Course instances scheduled to take place within this semester
   */
  @ManyToOne(
    (): ObjectType<CourseInstance> => CourseInstance,
    ({ semester }): Semester => semester
  )
  public courseInstances: CourseInstance[];
}
