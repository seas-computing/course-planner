import {
  Entity,
  Column,
  ObjectType,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { CourseInstance } from './courseinstance.entity';
import { NonClassEvent } from './nonclassevent.entity';
import { Absence } from './absence.entity';

export enum TERM {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

@Entity()
export abstract class Semester extends BaseEntity {
  /**
   * The academic year as a 4 digit integer
   */
  @Column({
    type: 'int',
    precision: 4,
    comment: 'The academmic year as a 4 digit integer',
  })
  public academicYear: number;

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

  /**
   * [[NonClassEvent]]s scheduled to occur within this semester.
   */
  @OneToMany(
    (): ObjectType<NonClassEvent> => NonClassEvent,
    ({ semester }): Semester => semester
  )
  public nonClassEvents: NonClassEvent[];

  @ManyToOne(
    (): ObjectType<Absence> => Absence,
    ({ semester }): Semester => semester
  )
  public absences: Absence[];
}
