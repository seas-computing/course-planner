import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ObjectType,
  Index,
} from 'typeorm';
import { TERM_PATTERN } from 'common/constants';
import { BaseEntity } from '../base/base.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { Area } from '../area/area.entity';
import { NonClassParent } from '../nonClassParent/nonclassparent.entity';

/**
 * The parent of many [[CourseInstance]] entities. The course entity is responsibile
 * for managing area, title and course code information. This informaion does
 * not change between course insances. It's modification would denote the
 * creation of an entirely new course
 */

@Entity()
export class Course extends BaseEntity {
  /**
   * The long title for the course
   *
   * @example `"Introduction to computer science"`
   */
  @Column({
    type: 'varchar',
    comment: 'The long title for the course (i.e - Introduction to computer science)',
  })
  public title: string;

  /**
   * The alphabetical part of the course code (i.e - The CS in CS 50) that
   * denotes the subject. In this case "CS" refers to "Computer Science"
   * @example `"CS"`
   */
  @Index()
  @Column({
    type: 'varchar',
    comment: 'The alphabetical part of the course code (i.e - The CS in CS 50) that denotes the subject. In this case "CS refers to "Computer Science"',
  })
  public prefix: string;

  /**
   * The numerical part of the course code (i.e - the CS in CS 50). May also
   * include an alphabetical component (i.e - CS 109b). This is split from
   * [[prefix]] to facilitate indexing and searching on [[prefix]]
   *
   * @example `"50"`
   * @example `"109B"`
   */
  @Column({
    type: 'varchar',
    comment: 'The numerical part of the course code (i.e - the CS in CS 50). May also include an alphabetical component (i.e - CS 109b)',
  })
  public number: string;

  /**
   * Indicates whether or not this course is an undergraduate course.
   */
  @Column({
    type: 'boolean',
    default: false,
  })
  public isUndergraduate: boolean = false;

  /**
   * Free text for administrators to record notes against a course
   */
  @Column({
    type: 'text',
    nullable: true,
    comment: 'Free text for administrators to record notes against a course',
  })
  public notes?: string;

  /**
   * Allows admin staff to hide courses and prevent their publication, either
   * because the courses are non-SEAS courses and should not be displayed on
   * the SEAS course schedule, or because they are still finalizing the course
   * details
  */
  @Column({
    type: 'boolean',
    default: true,
    comment: 'Allows admin staff to hide courses and prevent their publication either because the courses are non-SEAS courses and should not be displayed on the SEAS course schedule, or because they are still finalizing the course details',
  })
  public private: boolean = true;

  /**
   * A free text field for admin staff to record any other courses that this
   * course is the same as
   */
  @Column({
    type: 'text',
    default: '',
  })
  public sameAs: string = '';

  /**
   * The term this course is being delivered in. See [[TERM_PATTERN]] for
   * allowed values.
   */
  @Column({
    type: 'enum',
    enum: Object.values(TERM_PATTERN),
    nullable: true,
  })
  public termPattern?: TERM_PATTERN;

  /**
   * Not all courses are delivered by SEAS, some are delivered by other
   * divisions (for example, some courses may be science courses), therefore
   * it may be desireable to denote such courses to differenciate them from
   * courses offered by SEAS
   */
  @Column({
    type: 'boolean',
    comment: 'Not all courses are delivered by SEAS, some are delivered by other divisions (for example, some courses may be science courses), therefore it may be desireable to denote such courses to differenciate them from courses offered by SEAS',
    default: true,
  })
  public isSEAS: boolean = true;

  /**
   * A concatenation of [[Course.prefix]] and [[Course.number]]
   * @example `"CS 50"`
   */
  public get catalogNumber(): string {
    return `${this.prefix} ${this.number}`;
  }

  /**
   * An occurance of a [[Course]] that takes place in a [[Semester]]. Over time
   * one course can have many scheduled [[CourseInstance]]s. This allows
   * courses to be more easily re-used and repeated over time.
   *
   * ---
   * One [[Course]] has many [[CourseInstance]]s
   */
  @OneToMany(
    (): ObjectType<CourseInstance> => CourseInstance,
    ({ course }): Course => course,
    { cascade: ['insert'] }
  )
  public instances: CourseInstance[];

  /**
   * [[NonClassParent]]s are parent entities to [[NonClassevent]] and are
   * designed to be analogous to Courses, except that [[NonClassParent]]s can be
   * scheduled outside of and independently from a [[Course]].
   *
   * ---
   * Many [[NonClassParent]]s have one [[Course]]
   */
  @OneToMany(
    (): ObjectType<NonClassParent> => NonClassParent,
    ({ course }): Course => course
  )
  public nonClassParents: NonClassParent[];

  /**
  * The subject [[Area]] this course belongs to
  *
  * ---
  * Many [[Course]]s have one [[Area]]
  */
  @ManyToOne(
    (): ObjectType<Area> => Area,
    ({ courses }): Course[] => courses
  )
  public area: Area;
}
