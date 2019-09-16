import {
  Entity,
  Column,
  ManyToOne,
  ObjectType,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';
import { FacultyCourseInstance } from './facultycourseinstance.entity';
import { Semester } from './semester.entity';
import { Meeting } from './meeting.entity';

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
    comment: 'Indicates wether the course is currently being offered this semester and whether the course would normally be offered in other semesters',
  })
  public offered: OFFERED = OFFERED.BLANK;

  /**
   * Students enrolled in this course before shopping week
   */
  @Column({
    type: 'integer',
    nullable: true,
    default: null,
    comment: 'Students enrolled in this course before shopping week',
  })
  public pre?: number | null = null;

  /**
   * Students enrolled in this class during shopping week
   */
  @Column({
    type: 'integer',
    nullable: true,
    default: null,
    comment: 'Students enrolled in this course during shopping week',
  })
  public studyCard?: number | null = null;

  /**
   * Students enrolled in this course after shopping week is over
   */
  @Column({
    type: 'integer',
    nullable: true,
    default: null,
    comment: 'Students enrolled in this course after shopping week is over',
  })
  public actual?: number | null = null;

  /**
   * The [[Course]] that is an instance of.
   */
  @ManyToOne(
    (): ObjectType<Course> => Course,
    ({ instances }): CourseInstance[] => instances
  )
  public course: Course;

  @OneToMany(
    (): ObjectType<FacultyCourseInstance> => FacultyCourseInstance,
    ({ courseInstance }): CourseInstance => courseInstance
  )
  public facultyCourseInstances: FacultyCourseInstance[];

  @OneToMany(
    (): ObjectType<Meeting> => Meeting,
    ({ courseInstance }): CourseInstance => courseInstance
  )
  public meetings: Meeting[];

  /**
   * The [[Semester]] this course instance is scheduled to take place in
   */
  @OneToMany(
    (): ObjectType<Semester> => Semester,
    ({ courseInstances }): CourseInstance[] => courseInstances
  )
  public semester: Semester;
}
