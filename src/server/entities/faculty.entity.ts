import {
  Entity, Column, ObjectType, OneToMany, Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { FacultyCourseInstance } from './facultycourseinstance.entity';
import { Absence } from './absence.entity';

export enum FACULTY_TYPE {
  /**
   * The term ladder faculty refers to tenured full professors as well as
   * tenure-track professorial faculty (assistant and associate professors).
   *
   * See {@link https://www.seas.harvard.edu/faculty-research/people/ladder}
   * for more information
   */
  LADDER = 'LADDER',

  /**
   * The term non-ladder faculty refers to those holding term-limited
   * instructional and teaching appointments. These include professors of the
   * practice, preceptors, senior preceptors, lecturers, senior lecturers, as
   * well as visiting faculty.
   *
   * See {@link https://www.seas.harvard.edu/faculty-research/people/nonladder}
   * for more information
   */
  NON_LADDER = 'NON_LADDER',
}

@Entity()
export class Faculty extends BaseEntity {
  @Column({
    type: 'varchar',
    default: '',
  })
  public firstName: string;

  @Column({
    type: 'varchar',
    default: '',
  })
  public lastName: string;

  @Index()
  @Column({
    type: 'varchar',
  })
  public HUID: string;

  @Column({
    type: 'enum',
    enum: Object.values(FACULTY_TYPE),
    default: FACULTY_TYPE.NON_LADDER,
  })
  public category: FACULTY_TYPE = FACULTY_TYPE.NON_LADDER;

  /**
   * One [[Faculty]] has many [[FacultyCourseInstance]]s
   */
  @OneToMany(
    (): ObjectType<FacultyCourseInstance> => FacultyCourseInstance,
    ({ faculty }): Faculty => faculty
  )
  public facultyCourseInstances: FacultyCourseInstance[];

  /**
   * One [[Faculty]] has many [[Absence]]s
   */
  @OneToMany(
    (): ObjectType<Absence> => Absence,
    ({ faculty }): Faculty => faculty
  )
  public absences: Absence[];
}
