import {
  Entity, Column, ManyToMany, JoinTable, ObjectType, OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { CourseInstance } from './courseinstance.entity';
import { Absence } from './absence.entity';

export enum FACULTY_TYPE {
  /**
   * The term ladder faculty refers to tenured full professors as well as
   * tenure-track professorial faculty (assistant and associate professors).
   *
   * See {@link https://www.seas.harvard.edu/faculty-research/people/ladder}
   * for more information
   */
  LADDER = 'ladder',

  /**
   * The term non-ladder faculty refers to those holding term-limited
   * instructional and teaching appointments. These include professors of the
   * practice, preceptors, senior preceptors, lecturers, senior lecturers, as
   * well as visiting faculty.
   *
   * See {@link https://www.seas.harvard.edu/faculty-research/people/nonladder}
   * for more information
   */
  NON_LADDER = 'non_ladder',
}

@Entity()
export class Faculty extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: true,
  })
  public firstname: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  public lastname: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  public email: string;

  @Column({
    type: 'enum',
    enum: Object.values(FACULTY_TYPE),
    nullable: false,
    default: FACULTY_TYPE.NON_LADDER,
  })
  public category: FACULTY_TYPE = FACULTY_TYPE.NON_LADDER;

  @ManyToMany(
    (): ObjectType<CourseInstance> => CourseInstance,
    ({ faculty }): Faculty[] => faculty
  )
  @JoinTable()
  public courseInstances: CourseInstance[];

  @OneToMany(
    (): ObjectType<Absence> => Absence,
    ({ faculty }): Faculty => faculty
  )
  public absence: Absence[];
}
