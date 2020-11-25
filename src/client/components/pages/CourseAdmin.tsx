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
  TextInput,
  Dropdown,
} from 'mark-one';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { MESSAGE_TYPE, AppMessage, MESSAGE_ACTION } from 'client/classes';
import { MessageContext } from 'client/context';
import { TableRowProps } from 'mark-one/lib/Tables/TableRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { getAreaColor } from '../../../common/constants';
import { CourseAPI } from '../../api/courses';
import listFilter from './Filter';

/**
 * The component represents the Course Admin page, which will be rendered at
 * route '/course-admin'
 */

const CourseAdmin: FunctionComponent = function (): ReactElement {
  const [currentCourses, setCourses] = useState(
    [] as ManageCourseResponseDTO[]
  );
  const [prefixOptions, setPrefixOptions] = useState<{
    value: string; label: string
  }[]>([]);
  const [courseValue, setCourseValue] = useState<string>('');
  const [titleValue, setTitleValue] = useState<string>('');
  const [coursePrefixValue, setCoursePrefixValue] = useState<string>('');

  /**
   * Extract the "Course Prefix" unique values
   * from the course DTO area name
   */
  const coursePrefixSetup = (courses: ManageCourseResponseDTO[]) => {
    let initPrefixOptions = courses.map(
      (course) => ({ value: course.area.name, label: course.area.name })
    );
    initPrefixOptions = [...new Map(initPrefixOptions.map(
      (item) => [item.value, item]
    )).values()];
    initPrefixOptions.push({ value: 'All', label: 'All' });
    setPrefixOptions(initPrefixOptions);
    setCoursePrefixValue('All');
  };

  /**
   * Return filtered course based on the "Course Prefix",
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
    if (coursePrefixValue !== 'All') {
      courses = listFilter(
        courses,
        { field: 'area.name', value: coursePrefixValue, exact: true }
      );
    }
    return (courses);
  };

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
        coursePrefixSetup(courses);
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
    <div className="course-admin-table">
      <Table>
        <TableHead>
          <TableRow isStriped>
            <TableHeadingCell scope="col">Course Prefix</TableHeadingCell>
            <TableHeadingCell scope="col">Course</TableHeadingCell>
            <TableHeadingCell scope="col">Title</TableHeadingCell>
            <TableHeadingCell scope="col">Edit</TableHeadingCell>
          </TableRow>
          <TableRow isStriped>
            <TableHeadingCell scope="col">
              <Dropdown
                options={prefixOptions}
                value={coursePrefixValue}
                name="courseprefix"
                id="coursePrefix"
                label="The table will be filtered as selected in this course prefix dropdown filter"
                isLabelVisible={false}
                hideError
                onChange={(event:React.ChangeEvent<HTMLInputElement>) => {
                  setCoursePrefixValue(event.currentTarget.value);
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
                {course.area.name}
              </TableCell>
              <TableCell>{course.catalogNumber}</TableCell>
              <TableCell>{course.title}</TableCell>
              <TableCell>
                <BorderlessButton
                  variant={VARIANT.INFO}
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
