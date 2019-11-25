import {
  Entity,
  Column,
  ObjectType,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { NonClassEvent } from '../nonClassEvent/nonclassevent.entity';
import { Absence } from '../absence/absence.entity';

export enum TERM {
  FALL = 'FALL',
  SPRING = 'SPRING',
}

@Entity()
export class Semester extends BaseEntity {
  /**
   * The academic year as a 4 digit integer
   */
  @Column({
    type: 'numeric',
    precision: 4,
    scale: 0,
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
   *
   * ---
   * One [[Semester]] has many [[CourseInstance]]s
   */
  @OneToMany(
    (): ObjectType<CourseInstance> => CourseInstance,
    ({ semester }): Semester => semester
  )
  public courseInstances: CourseInstance[];

  /**
   * [[NonClassEvent]]s scheduled to occur within this semester.
   *
   * ---
   * One [[Semester]] has many [[NonClassEvent]]s
   */
  @OneToMany(
    (): ObjectType<NonClassEvent> => NonClassEvent,
    ({ semester }): Semester => semester
  )
  public nonClassEvents: NonClassEvent[];

  /**
   * One [[Semester]] has many [[Absence]]s
   */
  @OneToMany(
    (): ObjectType<Absence> => Absence,
    ({ semester }): Semester => semester
  )
  public absences: Absence[];
}
