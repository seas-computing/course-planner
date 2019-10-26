import {
  Entity, Column, ManyToOne, ObjectType, Index,
} from 'typeorm';
import { CourseInstance } from './courseinstance.entity';
import { Faculty } from './faculty.entity';
import { BaseEntity } from './base.entity';

@Entity('faculty_course_instances_course_instance')
export class FacultyCourseInstance extends BaseEntity {
  @Column({
    type: 'int',
  })
  public order: number;

  /**
   * Many [[FacultyCourseInstance]]s have one [[CourseInstance]]
   */
  @Index()
  @ManyToOne(
    (): ObjectType<CourseInstance> => CourseInstance,
    ({ facultyCourseInstances }):
    FacultyCourseInstance[] => facultyCourseInstances
  )
  public courseInstance: CourseInstance;

  /**
   * Many [[FacultyCourseInstance]]s have one [[Faculty]]
   */
  @Index()
  @ManyToOne(
    (): ObjectType<Faculty> => Faculty,
    ({ facultyCourseInstances }):
    FacultyCourseInstance[] => facultyCourseInstances
  )
  public faculty: Faculty;
}
