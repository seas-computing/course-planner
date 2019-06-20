import {
  Entity,
  Column,
  ManyToOne,
  ObjectType,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';
import { Faculty } from './faculty.entity';
import { Semester } from './semester.entity';

/**
 * Sets the offered status of a course instance for a given semester
 */
export enum OFFERED {
  /**
   * The course **IS** being offered this semester, but usually isn't
   */
  Y = 'Y',

  /**
   * The course is **NOT** being offered this semester, but usually is
   */
  N = 'N',

  /**
   * No changes made to course offering
   */
  BLANK = '',

  /**
   * The course is permanently retired and will not be offered going foward
   */
  RETIRED = 'RETIRED',
}


/**
 * [[CourseInstance]]s are instances of a [[Course]] that are scheduled for a
 * semester. One [[Course]] can have many [[CourseInstance]]s that are used
 * to track historical information such as name changes or change of [[OFFERED]]
 * status over time
 */
@Entity()
export class CourseInstance extends BaseEntity {
  /**
   * The name of this course instance. This is usually the same as
   * [[Course.name]], but it can change from year to year and this field is
   * used to record those changes and provide historical data on course name
   * changes and offered status.
   *
   * **Note:**
   * Other details such as course catalog prefix, coure code or course number
   * however will never change as changing these signifies the creation of a new
   * course. That is to say that a course is defined by it's course code/catalog
   * prefix. If those change, it is no longer the same course.
   */
  @Column({
    type: 'varchar',
  })
  public readonly name: string;

  /**
   * Indicates whether the course is currently being offered this [[Semester]],
   * and whether the course would normally be offered in other semesters
   */
  @Column({
    type: 'enum',
    enum: Object.values(OFFERED),
    default: OFFERED.BLANK,
  })
  public offered: OFFERED = OFFERED.BLANK;

  /**
   * The [[Course]] that is an instance of.
   */
  @ManyToOne(
    (): ObjectType<Course> => Course,
    ({ instances }): CourseInstance[] => instances
  )
  public course: Course;

  /**
   * A collection of [[Faculty]] associated with this course instance. Several
   * faculty members may be responsible for the delivery of one course instance.
   *
   * Usually, the first faculty member on the list is the primary faculty for
   * this course instance
   */
  @ManyToMany(
    (): ObjectType<Faculty> => Faculty,
    ({ courseInstances }): CourseInstance[] => courseInstances
  )
  public faculty: Faculty[];

  /**
   * The [[Semester]] this course instance is scheduled to take place in
   */
  @OneToMany(
    (): ObjectType<Semester> => Semester,
    ({ courseInstances }): CourseInstance[] => courseInstances
  )
  public semester: Semester;
}
