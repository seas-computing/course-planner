import {
  Entity, Column, ObjectType, OneToMany, Index, ManyToOne,
} from 'typeorm';
import { FACULTY_TYPE } from 'common/constants';
import { BaseEntity } from '../base/base.entity';
import { FacultyCourseInstance } from '../courseInstance/facultycourseinstance.entity';
import { Absence } from '../absence/absence.entity';
import { Area } from '../area/area.entity';

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

  /**
   * Notes specific to the faculty member outlining preferences and additional information
   */
  @Column({
    type: 'varchar',
    comment: 'Notes specific to the faculty member outlining preferences and additional information',
    nullable: true,
  })
  public notes: string;

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
    { cascade: ['insert','update'] }
  )
  public absences: Absence[];

  /**
   * The [[Area]] to which this [[Faculty]] belongs
   *
   * ---
   * Many [[Faculty]] members have one [[Area]]
   */
  @ManyToOne(
    (): ObjectType<Area> => Area,
    ({ faculty }): Faculty[] => faculty,
    { nullable: false }
  )
  public area: Area;
}
