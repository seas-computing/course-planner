import React, {
  Fragment,
  FunctionComponent,
  ReactElement,
  useState,
  useEffect,
  useContext,
} from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadingCell,
  TableCell,
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import { MessageContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { getCourseInstancesForYear } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

/**
 * Component representing the list of CourseInstances in a given Academic year
 */
const CourseInstanceList: FunctionComponent = (): ReactElement => {
  /**
  * Store the list of courses/instances to displayed
  */
  const [
    currentCourses,
    setCourses,
  ] = useState([] as CourseInstanceResponseDTO[]);

  const dispatchMessage = useContext(MessageContext);

  const [fetching, setFetching] = useState(false);

  useEffect((): void => {
    setFetching(true);
    getCourseInstancesForYear(2020)
      .then((courses: CourseInstanceResponseDTO[][]): void => {
        setCourses(courses[0]);
      })
      .catch((err: Error): void => {
        dispatchMessage({
          message: new AppMessage(err.message, MESSAGE_TYPE.ERROR),
          type: MESSAGE_ACTION.PUSH,
        });
      })
      .finally((): void => {
        setFetching(false);
      });
  }, []);

  return (
    <div className="course-instance-table">
      <Table>
        <TableHead>
          <TableRow isStriped>
            <TableHeadingCell scope="col">Area</TableHeadingCell>
            <TableHeadingCell scope="col">Course</TableHeadingCell>
            <TableHeadingCell scope="col">Title</TableHeadingCell>
            <TableHeadingCell scope="col">Same As</TableHeadingCell>
            <TableHeadingCell scope="col">Is SEAS?</TableHeadingCell>
            <TableHeadingCell scope="col">Is Undergraduate?</TableHeadingCell>
            <TableHeadingCell scope="col">Offered</TableHeadingCell>
            <TableHeadingCell scope="col">Instructors</TableHeadingCell>
            <TableHeadingCell scope="col">Times</TableHeadingCell>
            <TableHeadingCell scope="col">Room</TableHeadingCell>
            <TableHeadingCell scope="col">Pre</TableHeadingCell>
            <TableHeadingCell scope="col">Study</TableHeadingCell>
            <TableHeadingCell scope="col">Actual</TableHeadingCell>
            <TableHeadingCell scope="col">Offered</TableHeadingCell>
            <TableHeadingCell scope="col">Instructors</TableHeadingCell>
            <TableHeadingCell scope="col">Times</TableHeadingCell>
            <TableHeadingCell scope="col">Room</TableHeadingCell>
            <TableHeadingCell scope="col">Pre</TableHeadingCell>
            <TableHeadingCell scope="col">Study</TableHeadingCell>
            <TableHeadingCell scope="col">Actual</TableHeadingCell>
            <TableHeadingCell scope="col">Notes</TableHeadingCell>
            <TableHeadingCell scope="col">Details</TableHeadingCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentCourses.map(
            (
              course: CourseInstanceResponseDTO,
              index: number
            ): ReactElement => (
              <TableRow key={course.id} isStriped={index % 2 !== 0}>
                <TableCell>{course.area}</TableCell>
                <TableCell>{course.catalogNumber}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.sameAs}</TableCell>
                <TableCell>{course.isSEAS}</TableCell>
                <TableCell>{course.isUndergraduate}</TableCell>
                {
                  ['fall', 'spring'].map(
                    (term: string): ReactElement => (
                      <Fragment key={term}>
                        <TableCell>{course[term].offered}</TableCell>
                        <TableCell>
                          {course[term].instructors.length > 0 && (
                            <ol>
                              {course[term].instructors
                                .map((prof): ReactElement => (
                                  <li key={prof.id}>{prof.displayName}</li>
                                ))}
                            </ol>
                          )}
                        </TableCell>
                        <TableCell>
                          {course[term].meetings.length > 0
                              && course[term].meetings[0].day
                              && (
                                <ol>
                                  {course[term].meetings
                                    .map((mtg): ReactElement => (
                                      <li key={mtg.id}>
                                        {`${mtg.day}: ${mtg.startTime}-${mtg.endTime}`}
                                      </li>
                                    ))}
                                </ol>
                              )}
                        </TableCell>
                        <TableCell>
                          {course[term].meetings.length > 0
                              && course[term].meetings[0].day
                              && (
                                <ol>
                                  {course[term].meetings
                                    .map((mtg): ReactElement => (
                                      mtg.room
                                        ? (
                                          <li key={mtg.room.id}>
                                            {mtg.room.name}
                                          </li>
                                        )
                                        : null
                                    ))}
                                </ol>
                              )}
                        </TableCell>
                        <TableCell>
                          {course[term].preEnrollment}
                        </TableCell>
                        <TableCell>
                          {course[term].studyCardEnrollment}
                        </TableCell>
                        <TableCell>
                          {course[term].actualEnrollment}
                        </TableCell>
                      </Fragment>
                    )
                  )
                }
                <TableCell>
                  <BorderlessButton
                    variant={VARIANT.INFO}
                    onClick={(): void => { }}
                  >
                    <FontAwesomeIcon icon={faStickyNote} />
                  </BorderlessButton>
                </TableCell>
                <TableCell>
                  <BorderlessButton
                    variant={VARIANT.INFO}
                    onClick={(): void => { }}
                  >
                    <FontAwesomeIcon icon={faFolderOpen} />
                  </BorderlessButton>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
      {fetching && <p>Fetching data...</p>}
    </div>
  );
};

export default CourseInstanceList;
