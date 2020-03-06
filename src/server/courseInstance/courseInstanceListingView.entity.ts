import {
  ViewEntity,
  Connection,
  SelectQueryBuilder,
  ViewColumn,
  ObjectType,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Semester, TERM } from 'server/semester/semester.entity';
import { FacultyListingView } from 'server/faculty/facultyListingView.entity';
import { MeetingListingView } from 'server/meeting/meetingListingView.entity';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { CourseInstance } from './courseinstance.entity';
import { OFFERED } from '../../common/constants';

@ViewEntity('CourseInstanceListingView', {
  expression: (connection: Connection):
  SelectQueryBuilder<CourseInstance> => connection.createQueryBuilder()
    .select('ci.id', 'id')
    .addSelect('ci."courseId"', 'courseId')
    .addSelect('ci.offered', 'offered')
    .addSelect('ci."preEnrollment"', 'preEnrollment')
    .addSelect('ci."studyCardEnrollment"', 'studyCardEnrollment')
    .addSelect('ci."actualEnrollment"', 'actualEnrollment')
    .addSelect('s."academicYear"', 'calendarYear')
    .addSelect('s.term', 'term')
    .leftJoin(Semester, 's', 's.id = ci."semesterId"')
    .from(CourseInstance, 'ci'),
})
export class CourseInstanceListingView {
  @ViewColumn()
  public id: string;

  @ViewColumn()
  public calendarYear: number;

  @ViewColumn()
  public offered: OFFERED;

  @ViewColumn()
  public preEnrollment?: number | null;

  @ViewColumn()
  public studyCardEnrollment?: number | null;

  @ViewColumn()
  public actualEnrollment?: number | null;

  @ViewColumn()
  public term: TERM;

  public instructors: FacultyListingView[];

  public meetings: MeetingListingView[];

  @JoinColumn()
  @ManyToOne(
    (): ObjectType<CourseListingView> => CourseListingView,
    ({ spring }): CourseInstanceListingView[] => spring
  )
  @ManyToOne(
    (): ObjectType<CourseListingView> => CourseListingView,
    ({ fall }): CourseInstanceListingView[] => fall
  )
  public courseId: string;
}
