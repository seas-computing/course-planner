import {
  Entity, Column, ObjectType, OneToMany, Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { FacultyCourseInstance } from './facultycourseinstance.entity';
import { Absence } from './absence.entity';
import { FACULTY_TYPE } from '../../common/constants';

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

  /**
   * Affiliations to other schools this faculty member may have outside of SEAS
   */
  @Column({
    type: 'varchar',
    comment: 'Affiliations to other schools this faculty member may have outside of SEAS',
    nullable: true,
  })
  public jointWith: string;

  @Column({
    type: 'enum',
    enum: Object.values(FACULTY_TYPE),
  })
  public category: FACULTY_TYPE;

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
    ({ faculty }): Faculty => faculty,
    { cascade: ['insert'] }
  )
  public absences: Absence[];
}
