import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  BaseTheme,
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableCell,
  BorderlessButton,
  VARIANT,
} from 'mark-one';
import { ThemeContext } from 'styled-components';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import request, { AxiosPromise } from 'axios';
import { MESSAGE_TYPE, AppMessage, MESSAGE_ACTION } from 'client/classes';
import { MessageContext } from 'client/context';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

/**
 * The component represents the Course Admin page, which will be rendered at
 * route '/course-admin'
 */

export function getAllCourses(): AxiosPromise<ManageCourseResponseDTO[]> {
  return request.get('/api/courses/');
}

const CourseAdmin: FunctionComponent = function (): ReactElement {
  const [currentCourses, setCourses] = useState(
    [] as ManageCourseResponseDTO[]
  );

  const dispatchMessage = useContext(MessageContext);

  useEffect((): void => {
    getAllCourses()
      .then(({ data: courses }): ManageCourseResponseDTO[] => {
        setCourses(courses);
        return courses;
      })
      .catch((): void => {
        dispatchMessage({
          message: new AppMessage(
            'Unable to get course data from server. If the problem persists, contact SEAS Computing',
            MESSAGE_TYPE.ERROR
          ),
          type: MESSAGE_ACTION.PUSH,
        });
      });
  }, []);

  const theme: BaseTheme = useContext(ThemeContext);

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow isStriped>
            <TableHeadingCell scope="col">Course Prefix</TableHeadingCell>
            <TableHeadingCell scope="col">Course</TableHeadingCell>
            <TableHeadingCell scope="col">Title</TableHeadingCell>
            <TableHeadingCell scope="col">Edit</TableHeadingCell>
          </TableRow>
        </TableHead>
        <TableBody isScrollable>
          {currentCourses.map((course, i): ReactElement<TableRowProps> => (
            <TableRow isStriped={i % 2 === 1}>
              <TableCell
                backgroundColor={
                  theme
                    .color
                    .area[course.area.name.toLowerCase()]}
              >
                {course.area.name}
              </TableCell>
              <TableCell>{course.catalogNumber}</TableCell>
              <TableCell>{course.title}</TableCell>
              <TableCell>
                <BorderlessButton
                  variant={VARIANT.INFO}
                  // Edit button functionality will be added in separate ticket
                  // Set onClick property to an empty function as a placeholder
                  onClick={(): void => {}}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </BorderlessButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseAdmin;
