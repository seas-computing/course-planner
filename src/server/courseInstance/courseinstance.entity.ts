import {
  Entity,
  Column,
  ManyToOne,
  ObjectType,
  OneToMany,
} from 'typeorm';
import { OFFERED } from 'common/constants';
import { BaseEntity } from '../base/base.entity';
import { Course } from '../course/course.entity';
import { FacultyCourseInstance } from './facultycourseinstance.entity';
import { Semester } from '../semester/semester.entity';
import { Meeting } from '../meeting/meeting.entity';

/**
 * [[CourseInstance]]s are instances of a [[Course]] that are scheduled for a
 * semester. One [[Course]] can have many [[CourseInstance]]s that are used
 * to track historical information such as name changes or change of [[OFFERED]]
 * status over time
 */
@Entity()
export class CourseInstance extends BaseEntity {
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
    comment: 'Students enrolled in this course before shopping week',
    default: null,
  })
  public preEnrollment?: number | null = null;

  /**
   * Students enrolled in this class during shopping week
   */
  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Students enrolled in this course during shopping week',
    default: null,
  })
  public studyCardEnrollment?: number | null = null;

  /**
   * Students enrolled in this course after shopping week is over
   */
  @Column({
    type: 'integer',
    nullable: true,
    comment: 'Students enrolled in this course after shopping week is over',
    default: null,
  })
  public actualEnrollment?: number | null = null;

  /**
   * The [[Course]] that is an instance of.
   *
   * ---
   * Many [[CourseInstance]]s have one [[Course]]
   */
  @ManyToOne(
    (): ObjectType<Course> => Course,
    ({ instances }): CourseInstance[] => instances
  )
  public course: Course;

  /**
   * One [[CourseInstance]] has many [[FacultyCourseInstance]]
   */
  @OneToMany(
    (): ObjectType<FacultyCourseInstance> => FacultyCourseInstance,
    ({ courseInstance }): CourseInstance => courseInstance,
    { cascade: ['insert', 'update'] }
  )
  public facultyCourseInstances: FacultyCourseInstance[];

  /**
   * One [[CourseInstance]] has many [[Meeting]]s
   */
  @OneToMany(
    (): ObjectType<Meeting> => Meeting,
    ({ courseInstance }): CourseInstance => courseInstance,
    {
      cascade: ['insert', 'update'],
    }
  )
  public meetings: Meeting[];

  /**
   * The [[Semester]] this course instance is scheduled to take place in
   *
   * ---
   * Many [[Semester]]s have one [[CourseInstance]]
   */
  @ManyToOne(
    (): ObjectType<Semester> => Semester,
    ({ courseInstances }): CourseInstance[] => courseInstances
  )
  public semester: Semester;
}
