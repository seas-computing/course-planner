import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
} from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeadingCell,
  TableBody,
  TableCell,
  BorderlessButton,
  VARIANT,
  Button,
} from 'mark-one';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { MESSAGE_TYPE, AppMessage, MESSAGE_ACTION } from 'client/classes';
import { MessageContext } from 'client/context';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { getAreaColor } from '../../../common/constants';
import { CourseAPI } from '../../api/courses';
import { VerticalSpace } from '../layout';
import CourseModal from './CourseModal';

/**
 * Computes the id of the course button for the course being edited
 */
const computeEditCourseButtonId = (course: ManageCourseResponseDTO):
string => `editCourse${course.id}`;

/**
 * The component represents the Course Admin page, which will be rendered at
 * route '/course-admin'
 */

const CourseAdmin: FunctionComponent = function (): ReactElement {
  const [currentCourses, setCourses] = useState(
    [] as ManageCourseResponseDTO[]
  );

  /**
   * Keeps track of whether the course modal is currently visible.
   * By default, the modal is not visible.
   */
  const [
    courseModalVisible,
    setCourseModalVisible,
  ] = useState(false);

  /**
   * The currently selected faculty
   */
  const [
    currentCourse,
    setCurrentCourse,
  ] = useState(null as ManageCourseResponseDTO);

  /**
   * The current value for the message context
   */
  const dispatchMessage = useContext(MessageContext);

  /**
   * Gets the course data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    CourseAPI.getAllCourses()
      .then((courses): ManageCourseResponseDTO[] => {
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
  }, [dispatchMessage]);

  return (
    <>
      <VerticalSpace>
        <div className="create-course-button">
          <Button
            id="createCourse"
            onClick={
              (): void => {
                setCurrentCourse(null);
                setCourseModalVisible(true);
              }
            }
            variant={VARIANT.INFO}
          >
            Create New Course
          </Button>
        </div>
      </VerticalSpace>
      <div className="course-admin-table">
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
              <TableRow isStriped={i % 2 === 1} key={course.id}>
                <TableCell
                  backgroundColor={getAreaColor(course.area.name)}
                >
                  {course.area.name}
                </TableCell>
                <TableCell>{course.catalogNumber}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>
                  <BorderlessButton
                    id={computeEditCourseButtonId(course)}
                    variant={VARIANT.INFO}
                    onClick={
                      (): void => {
                        setCurrentCourse(course);
                        setCourseModalVisible(true);
                      }
                    }
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </BorderlessButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CourseModal
          isVisible={courseModalVisible}
          currentCourse={currentCourse}
          onClose={(): void => {
            // Sets the focus back to the button that opened the modal
            if (currentCourse) {
              setCourseModalVisible(false);
              const editButtonId = computeEditCourseButtonId(currentCourse);
              const editButton = document.getElementById(editButtonId);
              // this will run after the data is loaded, so no delay is necessary
              window.setTimeout((): void => {
                editButton.focus();
              }, 0);
            } else {
              setCourseModalVisible(false);
              window.setTimeout((): void => document.getElementById('createCourse').focus(), 0);
            }
          }}
        />
      </div>
    </>
  );
};

export default CourseAdmin;
