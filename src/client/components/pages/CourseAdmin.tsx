import React, {
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
  useEffect,
  useCallback,
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
  TextInput,
  Dropdown,
} from 'mark-one';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { MESSAGE_TYPE, AppMessage, MESSAGE_ACTION } from 'client/classes';
import { MessageContext, MetadataContext } from 'client/context';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { getAreaColor } from '../../../common/constants';
import { CourseAPI } from '../../api/courses';
import { VerticalSpace } from '../layout';
import CourseModal from './Courses/CourseModal';
import { listFilter } from './Filter';
import FontWrapper from '../general/typography/FontWrapper';

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
  /**
   * The current list of courses used to populate the Course Admin tab
   */
  const [currentCourses, setCourses] = useState(
    [] as ManageCourseResponseDTO[]
  );

  /**
   * The current value for the metadata context
   */
  const metadata = useContext(MetadataContext);

  const [courseValue, setCourseValue] = useState<string>('');
  const [titleValue, setTitleValue] = useState<string>('');
  const [areaValue, setAreaValue] = useState<string>('All');

  /**
   * Return filtered course based on the "Course Area",
   * "Course" and "Title" fileds filter.
   * Note: .trim() might be used to remove whitespaces.
   * Need to ask Vittorio about the .trim()
   */
  const filteredCourses = (): ManageCourseResponseDTO[] => {
    let courses = [...currentCourses];
    courses = listFilter(
      courses,
      { field: 'catalogNumber', value: courseValue, exact: false }
    );
    courses = listFilter(
      courses,
      { field: 'title', value: titleValue, exact: false }
    );
    if (areaValue !== 'All') {
      courses = listFilter(
        courses,
        { field: 'area.name', value: areaValue, exact: true }
      );
    }
    return (courses);
  };

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

  const loadCourses = useCallback(async (): Promise<void> => {
    try {
      const loadedCourses = await CourseAPI.getAllCourses();
      setCourses(loadedCourses);
    } catch (e) {
      dispatchMessage({
        message: new AppMessage(
          `Unable to get course data from server: ${(e as Error).message}. If the problem persists, contact SEAS Computing`,
          MESSAGE_TYPE.ERROR
        ),
        type: MESSAGE_ACTION.PUSH,
      });
    }
  }, [dispatchMessage]);

  /**
   * Gets the course data from the server
   * If it fails, display a message for the user
   */
  useEffect((): void => {
    void loadCourses();
  }, [loadCourses]);

  return (
    <div data-testid="courseAdminPage">
      <VerticalSpace>
        <div className="create-course-button">
          <Button
            id="createCourse"
            onClick={
              (): void => {
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
              <TableHeadingCell scope="col">Area</TableHeadingCell>
              <TableHeadingCell scope="col">Course</TableHeadingCell>
              <TableHeadingCell scope="col">Title</TableHeadingCell>
              <TableHeadingCell scope="col">Edit</TableHeadingCell>
            </TableRow>
            <TableRow isStriped>
              <TableHeadingCell scope="col">
                <Dropdown
                  options={
                    [{ value: 'All', label: 'All' }]
                      .concat(metadata.areas.map((area) => ({
                        value: area,
                        label: area,
                      })))
                  }
                  value={areaValue}
                  name="areaValue"
                  id="areaValue"
                  label="The table will be filtered as selected in this area dropdown filter"
                  isLabelVisible={false}
                  hideError
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                    setAreaValue(event.currentTarget.value);
                  }}
                />
              </TableHeadingCell>
              <TableHeadingCell scope="col">
                <TextInput
                  id="course"
                  name="course"
                  value={courseValue}
                  placeholder="Filter by Course"
                  label="The table will be filtered as characters are typed in this course filter field"
                  isLabelVisible={false}
                  hideError
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                    setCourseValue(event.currentTarget.value);
                  }}
                />
              </TableHeadingCell>
              <TableHeadingCell scope="col">
                <TextInput
                  id="title"
                  name="title"
                  value={titleValue}
                  placeholder="Filter by Title"
                  label="The table will be filtered as characters are typed in this title filter field"
                  isLabelVisible={false}
                  hideError
                  onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                    setTitleValue(event.currentTarget.value);
                  }}
                />
              </TableHeadingCell>
              <TableHeadingCell scope="col"> </TableHeadingCell>
            </TableRow>
          </TableHead>
          <TableBody isScrollable>
            {filteredCourses().map((course, i): ReactElement<TableRowProps> => (
              <TableRow isStriped={i % 2 === 1} key={course.id}>
                <TableCell
                  backgroundColor={getAreaColor(course.area.name)}
                >
                  <FontWrapper>{course.area.name}</FontWrapper>
                </TableCell>
                <TableCell>
                  <FontWrapper>{course.catalogNumber}</FontWrapper>
                </TableCell>
                <TableCell>
                  <FontWrapper>{course.title}</FontWrapper>
                </TableCell>
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
            setCourseModalVisible(false);
            // Sets the focus back to the button that opened the modal
            if (currentCourse) {
              const editButtonId = computeEditCourseButtonId(currentCourse);
              const editButton = document.getElementById(editButtonId);
              // this will run after the data is loaded, so no delay is necessary
              window.setTimeout((): void => {
                editButton.focus();
              }, 0);
              setCurrentCourse(null);
            } else {
              window.setTimeout((): void => document.getElementById('createCourse').focus(), 0);
            }
          }}
          onSuccess={async (): Promise<void> => {
            await loadCourses();
          }}
        />
      </div>
    </div>
  );
};

export default CourseAdmin;
