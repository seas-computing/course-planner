import {
  Entity, OneToMany, ObjectType, Column, ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Semester } from './semester.entity';
import { Faculty } from './faculty.entity';


/**
 * Describes the different types of leave available to [[Faculty]] members at
 * Harvard.
 *
 * For more information regarding the types of leave available - see
 * {@link https://facultyresources.fas.harvard.edu/leaves the FAS website}
 */
export enum ABSENCE_TYPE {
  /**
   * A period of paid research leave granted for study or travel.
   * This is typically only available to ladder faculty
   */
  SABBATICAL = 'SABBATICAL',

  /**
   * Faculty member is not currently on sabbatical, but is eligible to take
   * a sabbatical. Usually sabbatical is available only to tenured professors.
   * Non-ladder faculty members, with the exception of Professors in Residence
   * and Professors of the Practice, are not eligible for either paid or unpaid
   * research leaves.
   */
  SABBATICAL_ELIGIBLE = 'SABBATICAL_ELIGIBLE',

  /**
   * Faculty member is not eligble for sabbatical. Typically this would  be
   * non-faculty staff, or non-ladder faculty.
   */
  SABBATICAL_INELIGIBLE = 'SABBATICAL_INELIGIBLE',

  /**
   * Relief of some teaching responsibilites in order to perform administrative
   * work related to the faculty member's role
   */
  TEACHING_RELIEF = 'TEACHING_RELIEF',

  /**
   * Similar to [[SABBATICAL]], but typically unpaid. Like sabbaticals -
   * only ladder faculty are eligible for research leave
   */
  RESEARCH_LEAVE = 'RESEARCH_LEAVE',

  /**
   * All staff are eligible for parental leave
   *
   * See: {@link https://hr.harvard.edu/leaves-absence}
   */
  PARENTAL_LEAVE = 'PARENTAL_LEAVE',

  /**
   * Indicates that staff member is no longer active. They may have retired,
   * moved, or are no longer at Harvard
   */
  NO_LONGER_ACTIVE = 'NO_LONGER_ACTIVE',
}

/**
 *
 */
@Entity()
export class Absence extends BaseEntity {
  /**
   * The type of absence (i.e: Parental Leave, Research Leave etc.) Permitted
   * values can be found in [[ABSENCE_TYPE]].
   */
  @Column({
    type: 'enum',
    enum: Object.values(ABSENCE_TYPE),
    comment: 'The type of absence (i.e: Parental Leave, Research Leave etc.)',
  })
  public type: ABSENCE_TYPE;

  /**
   * The [[Semester]] this absence occurs in
   */
  @OneToMany(
    (): ObjectType<Semester> => Semester,
    ({ absences }): Absence[] => absences
  )
  public semester: Semester;

  /**
   * The [[Faculty]] member who is absent
   */
  @ManyToOne(
    (): ObjectType<Faculty> => Faculty,
    ({ absences }): Absence[] => absences
  )
  public faculty: Faculty;
}
