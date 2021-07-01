import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ObjectType,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { TERM_PATTERN, IS_SEAS } from 'common/constants';
import { BaseEntity } from '../base/base.entity';
import { CourseInstance } from '../courseInstance/courseinstance.entity';
import { Area } from '../area/area.entity';

/**
 * The parent of many [[CourseInstance]] entities. The course entity is responsibile
 * for managing area, title and course code information. This informaion does
 * not change between course insances. It's modification would denote the
 * creation of an entirely new course
 */

@Entity()
@Index(['prefix', 'numberInteger', 'numberAlphabetical'])
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
   * The numerical part of the course number (e.g. - the 109 in CS 109b). This
   * is needed to facilitate numerical sorting such that "CS 50" appears before
   * "CS 109b".
   *
   * This field is not selected by default, so queries will need to explicitly
   * include it.
   *
   * @example `50`
   * @example `109`
   */

  @Column({
    type: 'integer',
    comment: 'Only the numerical portion of a course number (e.g. - 109 in "CS 109b")',
    select: false,
    nullable: true,
  })
  public numberInteger: number;

  /**
   * The alphabetical part of the course number (e.g. - the 109 in CS 109b). This
   * is needed in conjunction with the numberInteger column to facilitate
   * numerical sorting such that "CS 109a" appears before "CS 109b".
   *
   * This field is not selected by default, so queries will need to explicitly
   * include it.
   *
   * @example `"b"`
   */

  @Column({
    type: 'text',
    comment: 'Only the alphabetical portion, if any, of a course number (e.g. the "a" of "CS 109a")',
    select: false,
    nullable: true,
  })
  public numberAlphabetical: string;

  /**
   * Indicates whether or not this course is an undergraduate course.
   */
  @Column({
    type: 'boolean',
    default: false,
  })
  public isUndergraduate = false;

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
  public private = true;

  /**
   * A free text field for admin staff to record any other courses that this
   * course is the same as
   */
  @Column({
    type: 'text',
    default: '',
  })
  public sameAs = '';

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
    type: 'enum',
    enum: Object.values(IS_SEAS),
    comment: 'Not all courses are delivered by SEAS, some are delivered by other divisions (for example, some courses may be science courses), therefore it may be desireable to denote such courses to differenciate them from courses offered by SEAS',
    default: IS_SEAS.Y,
  })
  public isSEAS: IS_SEAS = IS_SEAS.Y;

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
  * The subject [[Area]] this course belongs to
  *
  * ---
  * Many [[Course]]s have one [[Area]]
  */
  @ManyToOne(
    (): ObjectType<Area> => Area,
    ({ courses }): Course[] => courses,
    {
      nullable: false,
      cascade: ['insert'],
    }
  )
  public area: Area;

  /**
   * Before inserting or updating a course, this will parse the [[number]]
   * string and save the integer and alphabetical portions in the respective
   * [[numberInteger]] and [[numberAlphabetical]] fields.
   */
  @BeforeInsert()
  @BeforeUpdate()
  parseCourseNumber():void {
    const numberMatch = /(?<int>\d+)?(?<alpha>[a-zA-Z\s]+)?/.exec(this.number);
    if (numberMatch && 'groups' in numberMatch) {
      const { alpha, int } = numberMatch.groups;
      this.numberInteger = int
        ? parseInt(int, 10)
        : null;
      this.numberAlphabetical = alpha || null;
    } else {
      this.numberInteger = null;
      this.numberAlphabetical = null;
    }
  }
}
