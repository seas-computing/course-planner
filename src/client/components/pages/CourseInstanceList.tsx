import React, {
  FunctionComponent, ReactElement, useState, useEffect, useContext,
} from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableHeadingCell, TableCell,
} from 'mark-one';
import { MessageContext } from 'client/context';
import CourseInstanceResponseDTO from 'common/dto/courses/CourseInstanceResponse';
import { getCourseInstancesForYear } from 'client/api';
import { MESSAGE_TYPE, MESSAGE_ACTION, AppMessage } from 'client/classes';

/**
 * Component representing the list of CourseInstances in a given Academic year
 */
const CourseInstanceList: FunctionComponent = (): ReactElement => {
  /**
  * Store the list of courses/instances to displayed
  */
  const [currentCourses, setCourses] = useState([] as CourseInstanceResponseDTO[]);

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
          </TableRow>
        </TableHead>
        <TableBody>
          {currentCourses.map(
            (course: CourseInstanceResponseDTO): ReactElement => (
              <TableRow key={course.id}>
                <TableCell>{course.area}</TableCell>
                <TableCell>{course.catalogNumber}</TableCell>
                <TableCell>{course.title}</TableCell>
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
