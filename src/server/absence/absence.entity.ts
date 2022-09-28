import {
  Entity, ObjectType, Column, ManyToOne,
} from 'typeorm';
import { ABSENCE_TYPE } from 'common/constants';
import { BaseEntity } from '../base/base.entity';
import { Semester } from '../semester/semester.entity';
import { Faculty } from '../faculty/faculty.entity';

@Entity()
export class Absence extends BaseEntity {
  /**
   * The type of absence (i.e: Parental Leave, Research Leave etc.) Permitted
   * values can be found in [[ABSENCE_TYPE]].
   *
   * This defaults to [[ABSENCE_TYPE.PRESENT]] to indicate that the faculty
   * member is not absent
   */
  @Column({
    type: 'enum',
    enum: Object.values(ABSENCE_TYPE),
    comment: 'The type of absence (i.e: Parental Leave, Research Leave etc.)',
    default: ABSENCE_TYPE.PRESENT,
  })
  public type: ABSENCE_TYPE;

  /**
   * The [[Semester]] this absence occurs in.
   *
   * ---
   * Many [[Absence]]s have one [[Semester]]
   */
  @ManyToOne(
    (): ObjectType<Semester> => Semester,
    ({ absences }): Absence[] => absences
  )
  public semester: Semester;

  /**
   * The [[Faculty]] member who is absent
   *
   * ---
   * One [[Faculty]] member has many [[Absence]]s
   */
  @ManyToOne(
    (): ObjectType<Faculty> => Faculty,
    ({ absences }): Absence[] => absences
  )
  public faculty: Faculty;
}
